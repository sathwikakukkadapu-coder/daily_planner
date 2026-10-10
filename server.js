import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Cloud Database (MongoDB Atlas) setup if MONGODB_URI is provided
let isMongoConnected = false;
let RoomModel = null;

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
if (MONGODB_URI && MONGODB_URI.startsWith('mongodb')) {
  mongoose
    .connect(MONGODB_URI, { dbName: 'duohabit' })
    .then(() => {
      console.log('✅ Connected to persistent MongoDB Atlas database!');
      isMongoConnected = true;
      const roomSchema = new mongoose.Schema(
        {
          roomId: { type: String, required: true, unique: true },
          state: { type: Object, required: true },
          updatedAt: { type: Number, default: Date.now }
        },
        { timestamps: true }
      );
      RoomModel = mongoose.model('Room', roomSchema);
    })
    .catch((err) => {
      console.warn('⚠️ Could not connect to MongoDB, falling back to local storage:', err.message);
    });
} else {
  console.log('ℹ️ Running with local/in-memory storage. (Set MONGODB_URI on Render for persistent cloud database).');
}

// Local storage directory fallback
const DATA_DIR = path.join(__dirname, 'data', 'rooms');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getRoomFilePath(roomId) {
  const cleanId = roomId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, `${cleanId}.json`);
}

// In-memory cache
const memoryStore = new Map();

async function loadRoomData(roomId) {
  // 1. Try MongoDB if connected
  if (isMongoConnected && RoomModel) {
    try {
      const doc = await RoomModel.findOne({ roomId });
      if (doc && doc.state) {
        memoryStore.set(roomId, doc.state);
        return doc.state;
      }
    } catch (err) {
      console.error('Error loading from MongoDB:', err);
    }
  }

  // 2. Check memory store
  if (memoryStore.has(roomId)) {
    return memoryStore.get(roomId);
  }

  // 3. Fallback to local file
  const filePath = getRoomFilePath(roomId);
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      memoryStore.set(roomId, parsed);
      return parsed;
    } catch (err) {
      console.error(`Error reading room file for ${roomId}:`, err);
    }
  }
  return null;
}

async function saveRoomData(roomId, data) {
  const stateToSave = {
    ...data,
    updatedAt: data.updatedAt || Date.now()
  };

  memoryStore.set(roomId, stateToSave);

  // 1. Save to MongoDB if connected
  if (isMongoConnected && RoomModel) {
    try {
      await RoomModel.findOneAndUpdate(
        { roomId },
        { roomId, state: stateToSave, updatedAt: stateToSave.updatedAt },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Error saving to MongoDB:', err);
    }
  }

  // 2. Save to local file
  const filePath = getRoomFilePath(roomId);
  try {
    fs.writeFileSync(filePath, JSON.stringify(stateToSave, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error saving room file for ${roomId}:`, err);
  }
}

// Track connected sockets per room
const roomUsers = new Map();

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('join-room', async ({ roomId, userName, clientUpdatedAt }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      const prevSet = roomUsers.get(currentRoom);
      if (prevSet) {
        prevSet.delete(socket.id);
        io.to(currentRoom).emit('room-presence', { userCount: prevSet.size });
      }
    }

    currentRoom = roomId;
    socket.join(roomId);

    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    roomUsers.get(roomId).add(socket.id);

    // Load server state
    const serverState = await loadRoomData(roomId);

    if (serverState) {
      const serverTime = serverState.updatedAt || 0;
      const clientTime = clientUpdatedAt || 0;

      // Only send state if server is newer or equal; if client is newer, ask client to sync
      if (serverTime >= clientTime) {
        socket.emit('state-sync', serverState);
      } else {
        socket.emit('request-client-state');
      }
    }

    io.to(roomId).emit('room-presence', {
      userCount: roomUsers.get(roomId).size
    });
  });

  socket.on('sync-update', async ({ roomId, state }) => {
    if (roomId && state) {
      await saveRoomData(roomId, state);
      // Broadcast to other peers in room
      socket.to(roomId).emit('state-sync', state);
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom) {
      const set = roomUsers.get(currentRoom);
      if (set) {
        set.delete(socket.id);
        io.to(currentRoom).emit('room-presence', { userCount: set.size });
      }
    }
  });
});

// REST Endpoints
app.get('/api/room/:roomId', async (req, res) => {
  const data = await loadRoomData(req.params.roomId);
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

app.post('/api/room/:roomId', async (req, res) => {
  const roomId = req.params.roomId;
  const state = req.body;
  if (!state) {
    return res.status(400).json({ error: 'State is required' });
  }
  await saveRoomData(roomId, state);
  io.to(roomId).emit('state-sync', state);
  res.json({ success: true });
});

// Database & Network status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    isMongoConnected,
    storageType: isMongoConnected ? 'mongodb-cloud' : 'local-ephemeral',
    roomsCount: memoryStore.size
  });
});

// Network IP detection for mobile device testing
app.get('/api/network-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }

  res.json({
    localIp: addresses[0] || 'localhost',
    allIps: addresses,
    port: process.env.PORT || 3001,
    isMongoConnected
  });
});

// Serve static frontend in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 DuoHabit Server running on port ${PORT}`);
});
