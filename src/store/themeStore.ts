import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
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
      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme) => {
        set({ theme });

        // Apply theme immediately
        if (typeof window === 'undefined') return;

        const root = document.documentElement;

        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const resolvedTheme = prefersDark ? 'dark' : 'light';
          root.classList.toggle('dark', prefersDark);
          set({ resolvedTheme });
        } else {
          root.classList.toggle('dark', theme === 'dark');
          set({ resolvedTheme: theme });
        }
      },
    }),
    {
      name: 'pixelflow-theme',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : dummyStorage
      ),
    }
  )
);

// Initialize theme on client side
if (typeof window !== 'undefined') {
  const store = useThemeStore.getState();
  const { theme } = store;

  // Set initial theme
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
    store.setTheme('system');
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme === 'system') {
      root.classList.toggle('dark', e.matches);
      useThemeStore.setState({ resolvedTheme: e.matches ? 'dark' : 'light' });
    }
  });
}
