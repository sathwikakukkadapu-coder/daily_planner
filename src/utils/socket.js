import { io } from 'socket.io-client';
import { getBackendUrl, isNativeApp } from './apiConfig';

let socket = null;
let currentRoomId = null;

export function connectSocket(roomId, userName, callbacks = {}) {
  const { onStateSync, onPresence, onConnectStatus } = callbacks;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const backendUrl = getBackendUrl();

  // If in native app and no backend URL configured yet, run in offline local mode
  if (isNativeApp() && !backendUrl) {
    console.info('DuoHabit running in offline local mode. Configure backend URL to sync live.');
    if (onConnectStatus) onConnectStatus(false);
    return null;
  }

  // If backendUrl is set (e.g. VITE_API_URL or custom IP), connect to that URL.
  // Otherwise in desktop browser development, undefined connects to window.location (Vite proxy).
  const targetUrl = backendUrl || undefined;

  socket = io(targetUrl, {
    transports: ['websocket', 'polling'],
    timeout: 6000,
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
    console.warn('Socket connection error (working in offline local mode):', err.message);
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
