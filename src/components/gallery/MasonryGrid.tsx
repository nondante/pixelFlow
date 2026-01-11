'use client';

import { useState, useEffect, useMemo } from 'react';
import { UnsplashPhoto } from '@/types/unsplash';
import { ImageCard } from './ImageCard';

interface MasonryGridProps {
  photos: UnsplashPhoto[];
  onPhotoClick?: (photo: UnsplashPhoto) => void;
}

export function MasonryGrid({ photos, onPhotoClick }: MasonryGridProps) {
  const [columns, setColumns] = useState(3);

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

  // Distribute photos across columns
  const columnArrays = useMemo(() => {
    const cols: UnsplashPhoto[][] = Array.from({ length: columns }, () => []);
    const columnHeights = new Array(columns).fill(0);

    photos.forEach((photo) => {
      // Find column with smallest height
      const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights));
      cols[minHeightIndex].push(photo);
      // Estimate height based on aspect ratio
      columnHeights[minHeightIndex] += photo.height / photo.width;
    });

    return cols;
  }, [photos, columns]);

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {columnArrays.map((columnPhotos, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4">
          {columnPhotos.map((photo) => (
            <ImageCard
              key={photo.id}
              photo={photo}
              onClick={onPhotoClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
