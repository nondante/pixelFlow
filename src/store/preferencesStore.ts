import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LayoutType } from '@/types/gallery';

interface PreferencesStore {
  // State
  theme: 'light' | 'dark' | 'system';
  preferredLayout: LayoutType;
  favorites: string[]; // Array of photo IDs
  columnsCount: number;

  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setPreferredLayout: (layout: LayoutType) => void;
  toggleFavorite: (photoId: string) => void;
  isFavorite: (photoId: string) => boolean;
  setColumnsCount: (count: number) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      preferredLayout: 'masonry',
      favorites: [],
      columnsCount: 4,

      // Actions
      setTheme: (theme) => set({ theme }),

      setPreferredLayout: (layout) => set({ preferredLayout: layout }),

      toggleFavorite: (photoId) =>
        set((state) => ({
          favorites: state.favorites.includes(photoId)
            ? state.favorites.filter((id) => id !== photoId)
            : [...state.favorites, photoId],
        })),

      isFavorite: (photoId) => get().favorites.includes(photoId),

      setColumnsCount: (count) => set({ columnsCount: count }),
    }),
    {
      name: 'pixelflow-preferences',
      storage: createJSONStorage(() => {
        // Only use localStorage on client side
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a dummy storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
