'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { UnsplashPhoto } from '@/types/unsplash';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { unsplashLoader } from '@/utils/imageLoader';

interface ImageCardProps {
  photo: UnsplashPhoto;
  onClick?: (photo: UnsplashPhoto) => void;
  priority?: boolean;
}

export function ImageCard({ photo, onClick, priority = false }: ImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, isIntersecting] = useIntersectionObserver({
    freezeOnceVisible: true,
    rootMargin: '200px',
  });

  const shouldLoad = priority || isIntersecting;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
            <div
              className="absolute inset-0 blur-sm scale-110"
              style={{
                backgroundColor: photo.color || '#e5e7eb',
              }}
            />
          )}

          {/* Main Image */}
          <Image
            src={photo.urls.small}
            alt={photo.alt_description || photo.description || 'Unsplash photo'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loader={unsplashLoader}
            className={`object-cover transition-all duration-300 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } group-hover:scale-110`}
            onLoadingComplete={() => setIsLoaded(true)}
          />

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
