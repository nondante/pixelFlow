'use client';

import { useGalleryStore } from '@/store/galleryStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { motion } from 'framer-motion';

export function FavoritesToggle() {
  const { showFavoritesOnly, setShowFavoritesOnly } = useGalleryStore();
  const { favorites } = useFavoritesStore();

  const handleToggle = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
        transition-all duration-200
        ${
          showFavoritesOnly
            ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-pink-400 dark:hover:border-pink-500 hover:shadow-md'
        }
      `}
      aria-label={showFavoritesOnly ? 'Show all photos' : 'Show favorites'}
    >
      <motion.svg
        className="w-5 h-5"
        fill={showFavoritesOnly ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        animate={showFavoritesOnly ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </motion.svg>

      <span>{showFavoritesOnly ? 'Favorites' : 'Favorites'}</span>

      {/* Favorites count badge */}
      {favorites.length > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`
            flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold
            ${
              showFavoritesOnly
                ? 'bg-white/20 text-white'
                : 'bg-pink-500 text-white'
            }
          `}
        >
          {favorites.length}
        </motion.span>
      )}
    </button>
  );
}
