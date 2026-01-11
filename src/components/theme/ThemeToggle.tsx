'use client';

import { useThemeStore } from '@/store/themeStore';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
      title={
        theme === 'system'
          ? 'System theme'
          : theme === 'dark'
          ? 'Dark mode'
          : 'Light mode'
      }
    >
      <div className="relative w-5 h-5">
        <AnimatePresence mode="wait">
          {/* Sun icon (light mode) */}
          {resolvedTheme === 'light' && (
            <motion.svg
              key="sun"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 w-5 h-5 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </motion.svg>
          )}

          {/* Moon icon (dark mode) */}
          {resolvedTheme === 'dark' && (
            <motion.svg
              key="moon"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 w-5 h-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* System indicator (small dot) */}
        {theme === 'system' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
        )}
      </div>
    </button>
  );
}
