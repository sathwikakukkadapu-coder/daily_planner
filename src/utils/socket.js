import { io } from 'socket.io-client';

let socket = null;
let currentRoomId = null;

export function connectSocket(roomId, userName, callbacks = {}) {
  const { onStateSync, onPresence, onConnectStatus } = callbacks;

  if (socket) {
    socket.disconnect();
  }

  // In dev with Vite proxy, connecting to origin or window.location.origin works
  // If Vite is on port 5173, socket.io connects to same origin which gets proxied to 3001
  const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? undefined // use relative path so vite proxy handles it
    : window.location.origin;

  socket = io(serverUrl, {
    transports: ['websocket', 'polling'],
    timeout: 5000,
  });

  currentRoomId = roomId;

  socket.on('connect', () => {
    if (onConnectStatus) onConnectStatus(true);
    socket.emit('join-room', { roomId, userName });
  });

  socket.on('disconnect', () => {
    if (onConnectStatus) onConnectStatus(false);
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connection error (working in local offline mode):', err.message);
    if (onConnectStatus) onConnectStatus(false);
  });

  socket.on('state-sync', (incomingState) => {
    if (onStateSync) {
      onStateSync(incomingState);
    }
  });

  socket.on('room-presence', ({ userCount }) => {
    if (onPresence) {
      onPresence(userCount);
    }
  });

  return socket;
}

export function broadcastState(state) {
  if (socket && socket.connected && currentRoomId) {
    socket.emit('sync-update', { roomId: currentRoomId, state });
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
