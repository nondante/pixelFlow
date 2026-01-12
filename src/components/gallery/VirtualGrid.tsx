'use client';

import { useState, useEffect, useRef } from 'react';
import { UnsplashPhoto } from '@/types/unsplash';
import { ImageCard } from './ImageCard';

interface VirtualGridProps {
  photos: UnsplashPhoto[];
  onPhotoClick?: (photo: UnsplashPhoto) => void;
}

/**
 * Uniform grid layout with fixed aspect ratios
 * Optimized for performance with consistent sizing
 */
export function VirtualGrid({ photos, onPhotoClick }: VirtualGridProps) {
  const [columns, setColumns] = useState(4);
  const [hasInitiallyRendered, setHasInitiallyRendered] = useState(false);
  const stabilityTimeoutRef = useRef<NodeJS.Timeout>();
  const prevPhotoCountRef = useRef(0);

  const isReady = photos.length > 0 && hasInitiallyRendered;

  // Adjust columns based on viewport width
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1024) setColumns(3);
      else if (width < 1536) setColumns(4);
      else setColumns(5);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Set rendered only on initial load, not on incremental updates
  useEffect(() => {
    // Only trigger on initial load (going from 0 photos to some photos)
    if (photos.length > 0 && prevPhotoCountRef.current === 0 && !hasInitiallyRendered) {
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }

      // Use requestAnimationFrame to ensure DOM is ready, then wait for stability
      requestAnimationFrame(() => {
        stabilityTimeoutRef.current = setTimeout(() => {
          setHasInitiallyRendered(true);
        }, 50);
      });
    }

    prevPhotoCountRef.current = photos.length;

    return () => {
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }
    };
  }, [photos.length, hasInitiallyRendered]);

  return (
    <>
      <div
        className="grid gap-4 w-full"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          visibility: isReady ? 'visible' : 'hidden',
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: '1 / 1', // Fixed square aspect ratio for uniform grid
            }}
          >
            <ImageCard photo={photo} onClick={onPhotoClick} index={index} />
          </div>
        ))}
      </div>
      {!isReady && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
