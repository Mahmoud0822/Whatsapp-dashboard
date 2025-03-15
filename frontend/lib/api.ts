import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const session = await getSession();
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Se o erro for 401 (Unauthorized) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Aqui poderia implementar lógica de refresh token se necessário
        // Por enquanto, apenas redireciona para login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Funções de API para autenticação
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) => 
    api.post('/auth/register', { name, email, password }),
  
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) => 
    api.post('/auth/reset-password', { token, password }),
};

// Funções de API para WhatsApp
export const whatsappApi = {
  getStatus: () => 
    api.get('/whatsapp/status'),
  
  getQrCode: () => 
    api.get('/whatsapp/qrcode'),
  
  disconnect: () => 
    api.post('/whatsapp/disconnect'),
  
  sendMessage: (to: string, message: string) => 
    api.post('/whatsapp/send', { to, message }),
  
  getChats: () => 
    api.get('/whatsapp/chats'),
  
  getMessages: (chatId: string) => 
    api.get(`/whatsapp/chats/${chatId}/messages`),
};

// Funções de API para usuários
export const userApi = {
  getProfile: () => 
    api.get('/users/profile'),
  
  updateProfile: (data: any) => 
    api.put('/users/profile', data),
  
  changePassword: (currentPassword: string, newPassword: string) => 
    api.put('/users/change-password', { currentPassword, newPassword }),
};