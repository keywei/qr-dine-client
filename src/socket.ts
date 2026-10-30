import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initClientSocket = () => {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Client Socket] Connected:', socket?.id);
    });
  }
  return socket;
};

export const getClientSocket = () => {
  return socket || initClientSocket();
};

export const joinOrderRoom = (orderNo: string) => {
  const s = getClientSocket();
  s.emit('join', `order_${orderNo}`);
};

export const leaveOrderRoom = (orderNo: string) => {
  const s = getClientSocket();
  s.emit('leave', `order_${orderNo}`);
};

