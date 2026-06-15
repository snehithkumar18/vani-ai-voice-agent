import { create } from "zustand";

export interface AppUser {
  name: string;
  email: string;
  avatar?: string;
}

interface AppState {
  user: AppUser | null;
  activeAgentId: string | null;
  sidebarOpen: boolean;
  setUser: (user: AppUser | null) => void;
  setActiveAgent: (id: string | null) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  activeAgentId: null,
  sidebarOpen: true,
  setUser: (user) => set({ user }),
  setActiveAgent: (id) => set({ activeAgentId: id }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
