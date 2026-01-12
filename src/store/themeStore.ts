import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

// Dummy storage for SSR
const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      _hasHydrated: false,

      setHasHydrated: (hasHydrated) => {
        set({ _hasHydrated: hasHydrated });
      },

      setTheme: (theme) => {
        set({ theme });

        // Apply theme immediately
        if (typeof window === 'undefined') return;

        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
      },
    }),
    {
      name: 'pixelflow-theme',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : dummyStorage
      ),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);

          // Apply the theme after hydration
          if (typeof window !== 'undefined') {
            const root = document.documentElement;
            const { theme } = state;
            root.classList.toggle('dark', theme === 'dark');
          }
        }
      },
    }
  )
);

