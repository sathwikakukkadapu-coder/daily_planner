import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

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

// Storage directory for rooms
const DATA_DIR = path.join(__dirname, 'data', 'rooms');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getRoomFilePath(roomId) {
  // Sanitize room ID
  const cleanId = roomId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, `${cleanId}.json`);
}

function loadRoomData(roomId) {
  const filePath = getRoomFilePath(roomId);
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Error reading room file for ${roomId}:`, err);
    }
  }
  return null;
}

function saveRoomData(roomId, data) {
  const filePath = getRoomFilePath(roomId);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error saving room file for ${roomId}:`, err);
  }
}

// Track connected sockets per room
const roomUsers = new Map();

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('join-room', ({ roomId, userName }) => {
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

    // Send latest state if available
    const existing = loadRoomData(roomId);
    if (existing) {
      socket.emit('state-sync', existing);
    }

    io.to(roomId).emit('room-presence', {
      userCount: roomUsers.get(roomId).size
    });
  });

  socket.on('sync-update', ({ roomId, state }) => {
    if (roomId && state) {
      saveRoomData(roomId, state);
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
app.get('/api/room/:roomId', (req, res) => {
  const data = loadRoomData(req.params.roomId);
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

app.post('/api/room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const state = req.body;
  if (!state) {
    return res.status(400).json({ error: 'State is required' });
  }
  saveRoomData(roomId, state);
  io.to(roomId).emit('state-sync', state);
  res.json({ success: true });
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
    port: process.env.PORT || 3001
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
  console.log(`🚀 DuoHabit Server running on http://localhost:${PORT}`);
});
