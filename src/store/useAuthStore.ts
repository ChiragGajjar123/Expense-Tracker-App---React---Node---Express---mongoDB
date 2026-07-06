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

const runGraphQL = async (query: string, variables?: Record<string, any>) => {
  try {
    const res = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, message: json.errors?.[0]?.message || 'Network error' };
    }
    if (json.errors && json.errors.length > 0) {
      return { ok: false, message: json.errors[0].message };
    }
    return { ok: true, data: json.data };
  } catch (err: any) {
    return { ok: false, message: err.message || 'Network error. Please try again.' };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  verifySession: async () => {
    try {
      const query = `
        query GetMe {
          me {
            id
            name
            email
            avatar
            currency
            createdAt
          }
        }
      `;
      const res = await runGraphQL(query);
      if (res.ok && res.data?.me) {
        set({ user: res.data.me });
      } else {
        set({ user: null });
      }
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    const query = `
      mutation Register($name: String!, $email: String!, $password: String!) {
        register(name: $name, email: $email, password: $password) {
          success
          message
          user {
            id
            name
            email
            avatar
            currency
          }
        }
      }
    `;
    const res = await runGraphQL(query, { name, email, password });
    if (res.ok && res.data?.register?.success) {
      set({ user: res.data.register.user });
      return { success: true };
    }
    return { success: false, message: res.data?.register?.message || res.message };
  },

  login: async (email, password) => {
    const query = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          success
          message
          user {
            id
            name
            email
            avatar
            currency
          }
        }
      }
    `;
    const res = await runGraphQL(query, { email, password });
    if (res.ok && res.data?.login?.success) {
      set({ user: res.data.login.user });
      return { success: true };
    }
    return { success: false, message: res.data?.login?.message || res.message };
  },

  logout: async () => {
    try {
      const query = `
        mutation Logout {
          logout {
            success
            message
          }
        }
      `;
      await runGraphQL(query);
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      set({ user: null });
    }
  },

  updateProfile: async (profileData) => {
    const query = `
      mutation UpdateProfile($name: String, $currency: String) {
        updateProfile(name: $name, currency: $currency) {
          id
          name
          email
          avatar
          currency
        }
      }
    `;
    const res = await runGraphQL(query, profileData);
    if (res.ok && res.data?.updateProfile) {
      set({ user: res.data.updateProfile });
      return { success: true };
    }
    return { success: false, message: res.message };
  },

  changePassword: async (currentPassword, newPassword) => {
    const query = `
      mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
        changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
          success
          message
        }
      }
    `;
    const res = await runGraphQL(query, { currentPassword, newPassword });
    if (res.ok && res.data?.changePassword?.success) {
      return { success: true, message: res.data.changePassword.message };
    }
    return { success: false, message: res.data?.changePassword?.message || res.message };
  },

  deleteAccount: async (password) => {
    const query = `
      mutation DeleteAccount($password: String!) {
        deleteAccount(password: $password) {
          success
          message
        }
      }
    `;
    const res = await runGraphQL(query, { password });
    if (res.ok && res.data?.deleteAccount?.success) {
      set({ user: null });
      return { success: true, message: res.data.deleteAccount.message };
    }
    return { success: false, message: res.data?.deleteAccount?.message || res.message };
  },

  forgotPassword: async (email) => {
    const query = `
      mutation ForgotPassword($email: String!) {
        forgotPassword(email: $email) {
          success
          message
        }
      }
    `;
    const res = await runGraphQL(query, { email });
    if (res.ok && res.data?.forgotPassword) {
      return { success: res.data.forgotPassword.success, message: res.data.forgotPassword.message };
    }
    return { success: false, message: res.message };
  },

  resetPassword: async (token, newPassword) => {
    const query = `
      mutation ResetPassword($token: String!, $newPassword: String!) {
        resetPassword(token: $token, newPassword: $newPassword) {
          success
          message
          user {
            id
            name
            email
            avatar
            currency
          }
        }
      }
    `;
    const res = await runGraphQL(query, { token, newPassword });
    if (res.ok && res.data?.resetPassword?.success) {
      set({ user: res.data.resetPassword.user });
      return { success: true, message: res.data.resetPassword.message };
    }
    return { success: false, message: res.data?.resetPassword?.message || res.message };
  }
}));
