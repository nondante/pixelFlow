'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Blurhash } from 'react-blurhash';
import { UnsplashPhoto } from '@/types/unsplash';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { unsplashLoader } from '@/utils/imageLoader';
import { useFavoritesStore } from '@/store/favoritesStore';

interface ImageCardProps {
  photo: UnsplashPhoto;
  onClick?: (photo: UnsplashPhoto) => void;
  priority?: boolean;
  index?: number;
}

export function ImageCard({ photo, onClick, priority = false, index = 0 }: ImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, isIntersecting] = useIntersectionObserver({
    freezeOnceVisible: true,
    rootMargin: '200px',
  });

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const isFav = isFavorite(photo.id);

  const shouldLoad = priority || isIntersecting;

  // Stagger animation for initial load - very subtle
  const staggerDelay = Math.min(index * 0.02, 0.4);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(photo);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: staggerDelay }}
      className="group relative overflow-hidden rounded-lg cursor-pointer bg-gray-200 dark:bg-gray-800"
      onClick={() => onClick?.(photo)}
      style={{
        aspectRatio: `${photo.width} / ${photo.height}`,
      }}
    >
      {shouldLoad && (
        <>
          {/* BlurHash Placeholder */}
          {!isLoaded && photo.blur_hash && (
            <div className="absolute inset-0 overflow-hidden">
              <Blurhash
                hash={photo.blur_hash}
                width="100%"
                height="100%"
                resolutionX={32}
                resolutionY={32}
                punch={1}
                className="w-full h-full"
              />
            </div>
          )}

          {/* Main Image */}
          <Image
            src={photo.urls.small}
            alt={photo.alt_description || photo.description || 'Unsplash photo'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loader={unsplashLoader}
            className={`object-cover ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-103'
            }`}
            style={{
              transition: isLoaded
                ? 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)' // Faster smooth transition on hover
                : 'opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1), transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)', // Slow gentle load
              transform: isLoaded ? 'scale(1)' : 'scale(1.03)',
            }}
            onMouseEnter={(e) => {
              if (isLoaded) {
                (e.target as HTMLImageElement).style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (isLoaded) {
                (e.target as HTMLImageElement).style.transform = 'scale(1)';
              }
            }}
            onLoadingComplete={() => setIsLoaded(true)}
          />

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <AnimatePresence mode="wait">
              {isFav ? (
                <motion.svg
                  key="filled"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              ) : (
                <motion.svg
                  key="outline"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 text-gray-700 dark:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="text-sm font-medium truncate">{photo.user.name}</p>
              {photo.likes > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs">{photo.likes}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
