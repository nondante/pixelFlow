'use client';

import { useState, useEffect } from 'react';
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

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative"
          style={{
            aspectRatio: '1 / 1', // Fixed square aspect ratio for uniform grid
          }}
        >
          <ImageCard photo={photo} onClick={onPhotoClick} />
        </div>
      ))}
    </div>
  );
}
