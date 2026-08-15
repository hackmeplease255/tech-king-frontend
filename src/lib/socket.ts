'use client';

import { io, type Socket } from 'socket.io-client';
import { getToken } from './api/client';

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

let socket: Socket | null = null;

/** Get (or create) the authenticated socket. Reconnects automatically. */
export function getSocket(): Socket {
  if (socket) {
    const token = getToken();
    if (token && (socket.auth as { token?: string } | undefined)?.token !== token) {
      socket.auth = { token };
    }
    return socket;
  }
  socket = io(WS_URL, {
    auth: { token: getToken() },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10_000,
    timeout: 20_000,
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function onEvent<T>(event: string, handler: (payload: T) => void): () => void {
  const s = getSocket();
  s.on(event, handler as never);
  return () => {
    s.off(event, handler as never);
  };
}
