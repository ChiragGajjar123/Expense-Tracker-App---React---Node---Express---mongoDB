import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currency: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  verifySession: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; currency?: string }) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  deleteAccount: (password: string) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

const runREST = async (url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: Record<string, any>) => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${baseUrl}${url}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, message: json.message || 'Server error' };
    }
    return { ok: true, data: json };
  } catch (err: any) {
    return { ok: false, message: err.message || 'Network error. Please try again.' };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  verifySession: async () => {
    try {
      const res = await runREST('/api/auth/me', 'GET');
      if (res.ok && res.data?.user) {
        set({ user: res.data.user });
      } else {
        localStorage.removeItem('token');
        set({ user: null });
      }
    } catch {
      localStorage.removeItem('token');
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    const res = await runREST('/api/auth/register', 'POST', { name, email, password });
    if (res.ok && res.data?.success) {
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      set({ user: res.data.user });
      return { success: true };
    }
    return { success: false, message: res.data?.message || res.message };
  },

  login: async (email, password) => {
    const res = await runREST('/api/auth/login', 'POST', { email, password });
    if (res.ok && res.data?.success) {
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      set({ user: res.data.user });
      return { success: true };
    }
    return { success: false, message: res.data?.message || res.message };
  },

  logout: async () => {
    try {
      await runREST('/api/auth/logout', 'POST');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      localStorage.removeItem('token');
      set({ user: null });
    }
  },

  updateProfile: async (profileData) => {
    const res = await runREST('/api/auth/profile', 'PUT', profileData);
    if (res.ok && res.data?.user) {
      set({ user: res.data.user });
      return { success: true };
    }
    return { success: false, message: res.message };
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await runREST('/api/auth/password', 'PUT', { currentPassword, newPassword });
    if (res.ok && res.data?.success) {
      return { success: true, message: res.data.message };
    }
    return { success: false, message: res.data?.message || res.message };
  },

  deleteAccount: async (password) => {
    const res = await runREST('/api/auth/delete-account', 'POST', { password });
    if (res.ok && res.data?.success) {
      localStorage.removeItem('token');
      set({ user: null });
      return { success: true, message: res.data.message };
    }
    return { success: false, message: res.data?.message || res.message };
  },

  forgotPassword: async (email) => {
    const res = await runREST('/api/auth/forgot-password', 'POST', { email });
    if (res.ok && res.data?.success) {
      return { success: res.data.success, message: res.data.message };
    }
    return { success: false, message: res.message };
  },

  resetPassword: async (token, newPassword) => {
    const res = await runREST('/api/auth/reset-password', 'POST', { token, newPassword });
    if (res.ok && res.data?.success) {
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      set({ user: res.data.user });
      return { success: true, message: res.data.message };
    }
    return { success: false, message: res.data?.message || res.message };
  }
}));
