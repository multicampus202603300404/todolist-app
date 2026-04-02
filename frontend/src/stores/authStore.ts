import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  user: { id: string; email: string } | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: { id: string; email: string }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setToken: (token) => set({ accessToken: token, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));
