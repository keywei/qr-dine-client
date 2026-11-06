import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const activeRooms = new Set<string>();

const setupLifecycleListeners = (s: Socket) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (!s.connected) s.connect();
      window.dispatchEvent(new CustomEvent('socket:wake'));
    }
  });

  window.addEventListener('online', () => {
    if (!s.connected) s.connect();
  });
};

export const initClientSocket = () => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 10000,
    });

    socket.on('connect', () => {
      if (!socket?.recovered && activeRooms.size > 0) {
        socket?.emit('join', Array.from(activeRooms));
      }
      window.dispatchEvent(
        new CustomEvent('socket:status', {
          detail: { status: 'connected', recovered: socket?.recovered },
        }),
      );
    });

    socket.on('disconnect', (reason) => {
      window.dispatchEvent(
        new CustomEvent('socket:status', { detail: { status: 'disconnected', reason } }),
      );
    });

    setupLifecycleListeners(socket);
  }
  return socket;
};

export const getClientSocket = () => {
  return socket || initClientSocket();
};

export const joinOrderRoom = (orderNo: string) => {
  const room = `order_${orderNo}`;
  activeRooms.add(room);
  getClientSocket().emit('join', room);
};

export const leaveOrderRoom = (orderNo: string) => {
  const room = `order_${orderNo}`;
  activeRooms.delete(room);
  getClientSocket().emit('leave', room);
};
