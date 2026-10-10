import { io } from 'socket.io-client';
import { getBackendUrl, isNativeApp } from './apiConfig';

let socket = null;
let currentRoomId = null;

export function connectSocket(roomId, userName, callbacks = {}, clientUpdatedAt = 0) {
  const { onStateSync, onPresence, onConnectStatus, onRequestClientState } = callbacks;

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

  const targetUrl = backendUrl || undefined;

  socket = io(targetUrl, {
    transports: ['websocket', 'polling'],
    timeout: 6000,
  });

  currentRoomId = roomId;

  socket.on('connect', () => {
    if (onConnectStatus) onConnectStatus(true);
    socket.emit('join-room', { roomId, userName, clientUpdatedAt });
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

  socket.on('request-client-state', () => {
    if (onRequestClientState) {
      onRequestClientState();
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
