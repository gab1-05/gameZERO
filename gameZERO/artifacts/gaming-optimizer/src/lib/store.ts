import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  lastAppliedOptimizations: string[];
  addAppliedOptimization: (id: string) => void;
  favoriteGames: string[];
  toggleFavoriteGame: (gameId: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      lastAppliedOptimizations: [],
      addAppliedOptimization: (id) =>
        set((state) => ({
          lastAppliedOptimizations: [...state.lastAppliedOptimizations, id],
        })),
      favoriteGames: [],
      toggleFavoriteGame: (gameId) =>
        set((state) => ({
          favoriteGames: state.favoriteGames.includes(gameId)
            ? state.favoriteGames.filter((id) => id !== gameId)
            : [...state.favoriteGames, gameId],
        })),
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'gamezero-storage',
    }
  )
);