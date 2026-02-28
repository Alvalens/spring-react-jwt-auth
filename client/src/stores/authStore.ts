import { create } from "zustand";
import * as authApi from "@/api/auth";
import { setAccessToken } from "@/api/axios";

interface User {
  email: string;
  firstName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: authApi.LoginRequest) => Promise<void>;
  register: (data: authApi.RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  login: async (data) => {
    const res = await authApi.login(data);
    setAccessToken(res.data.accessToken);
    set({
      user: { email: res.data.email, firstName: res.data.firstName },
      isAuthenticated: true,
    });
  },

  register: async (data) => {
    const res = await authApi.register(data);
    setAccessToken(res.data.accessToken);
    set({
      user: { email: res.data.email, firstName: res.data.firstName },
      isAuthenticated: true,
    });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false });
    }
  },

  initAuth: async () => {
    try {
      const res = await authApi.refresh();
      setAccessToken(res.data.accessToken);
      set({
        user: { email: res.data.email, firstName: res.data.firstName },
        isAuthenticated: true,
        loading: false,
      });
    } catch {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
}));
