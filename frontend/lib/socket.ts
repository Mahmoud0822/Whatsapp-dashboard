import { io, Socket } from 'socket.io-client';
import { getSession } from 'next-auth/react';

let socket: Socket | null = null;

export const initializeSocket = async (): Promise<Socket> => {
  if (socket) return socket;

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
  
  // Obter token de autenticação da sessão
  const session = await getSession();
  const token = session?.user?.accessToken;

  // Inicializar socket com autenticação
  socket = io(SOCKET_URL, {
    auth: token ? { token } : undefined,
    transports: ['websocket'],
    autoConnect: true,
  });

  // Configurar eventos básicos
  socket.on('connect', () => {
    console.log('Socket conectado');
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket desconectado: ${reason}`);
  });

  socket.on('connect_error', (error) => {
    console.error('Erro de conexão do socket:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Tipos de eventos do WhatsApp
export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: number;
  hasMedia: boolean;
  mediaUrl?: string;
  mediaType?: string;
}

export interface WhatsAppStatus {
  connected: boolean;
  state: string;
  qrCode?: string;
}

// Hooks para eventos específicos
export const subscribeToWhatsAppStatus = (callback: (status: WhatsAppStatus) => void): (() => void) => {
  if (!socket) {
    console.error('Socket não inicializado. Chame initializeSocket primeiro.');
    return () => {};
  }

  socket.on('whatsapp:status', callback);
  
  return () => {
    socket.off('whatsapp:status', callback);
  };
};

export const subscribeToNewMessages = (callback: (message: WhatsAppMessage) => void): (() => void) => {
  if (!socket) {
    console.error('Socket não inicializado. Chame initializeSocket primeiro.');
    return () => {};
  }

  socket.on('whatsapp:message', callback);
  
  return () => {
    socket.off('whatsapp:message', callback);
  };
};

export const subscribeToQrCode = (callback: (qrCode: string) => void): (() => void) => {
  if (!socket) {
    console.error('Socket não inicializado. Chame initializeSocket primeiro.');
    return () => {};
  }

  socket.on('whatsapp:qrcode', callback);
  
  return () => {
    socket.off('whatsapp:qrcode', callback);
  };
};