// lib/api.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// instance بدون توكن — لمهام زي login, register
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// instance بيضيف التوكن من session — للمهام المحمية
const secureAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to secure requests
secureAxios.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`;
  }
  return config;
});

// Handle 401 errors
secureAxios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Public auth APIs
export const authApi = {
  login: (email: string, password: string) =>
    authAxios.post("/auth/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    authAxios.post("/auth/register", { name, email, password }),

  forgotPassword: (email: string) =>
    authAxios.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    authAxios.post("/auth/reset-password", { token, password }),
};

// Secure APIs
export const whatsappApi = {
  getStatus: () => secureAxios.get("/whatsapp/status"),
  getQrCode: () => secureAxios.get("/whatsapp/qrcode"),
  disconnect: () => secureAxios.post("/whatsapp/disconnect"),
  sendMessage: (to: string, message: string) =>
    secureAxios.post("/whatsapp/send", { to, message }),
  getChats: () => secureAxios.get("/whatsapp/chats"),
  getMessages: (chatId: string) =>
    secureAxios.get(`/whatsapp/chats/${chatId}/messages`),
};

export const userApi = {
  getProfile: () => secureAxios.get("/users/profile"),
  updateProfile: (data: any) => secureAxios.put("/users/profile", data),
  changePassword: (currentPassword: string, newPassword: string) =>
    secureAxios.put("/users/change-password", {
      currentPassword,
      newPassword,
    }),
};
