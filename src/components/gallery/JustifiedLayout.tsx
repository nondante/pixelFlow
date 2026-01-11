'use client';

import { useMemo } from 'react';
import { UnsplashPhoto } from '@/types/unsplash';
import { ImageCard } from './ImageCard';

interface JustifiedLayoutProps {
  photos: UnsplashPhoto[];
  onPhotoClick?: (photo: UnsplashPhoto) => void;
  targetRowHeight?: number;
}

interface LayoutRow {
  photos: UnsplashPhoto[];
  scaleFactor: number;
}

export function JustifiedLayout({
  photos,
  onPhotoClick,
  targetRowHeight = 250,
}: JustifiedLayoutProps) {
  // Calculate justified layout
  const rows = useMemo(() => {
    if (photos.length === 0) return [];

    const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 64 : 1200; // Account for padding
    const gap = 16; // Gap between images
    const rows: LayoutRow[] = [];
    let currentRow: UnsplashPhoto[] = [];
    let currentRowWidth = 0;

    photos.forEach((photo, index) => {
      const aspectRatio = photo.width / photo.height;
      const scaledWidth = targetRowHeight * aspectRatio;

      currentRow.push(photo);
      currentRowWidth += scaledWidth;

      // Account for gaps between images
      const totalGapWidth = (currentRow.length - 1) * gap;
      const totalWidth = currentRowWidth + totalGapWidth;

      // Check if row is full or it's the last photo
      const isLastPhoto = index === photos.length - 1;
      const shouldBreak = totalWidth >= containerWidth || isLastPhoto;

      if (shouldBreak) {
        // Calculate scale factor to fit the row exactly
        const availableWidth = containerWidth - (currentRow.length - 1) * gap;
        const scaleFactor = availableWidth / currentRowWidth;

        rows.push({
          photos: [...currentRow],
          scaleFactor: isLastPhoto && totalWidth < containerWidth ? 1 : scaleFactor,
        });

        // Reset for next row
        currentRow = [];
        currentRowWidth = 0;
      }
    });

    return rows;
  }, [photos, targetRowHeight]);

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {row.photos.map((photo) => {
            const aspectRatio = photo.width / photo.height;
            const width = targetRowHeight * aspectRatio * row.scaleFactor;
            const height = targetRowHeight * row.scaleFactor;

            return (
              <div
                key={photo.id}
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  flexShrink: 0,
                }}
              >
                <ImageCard photo={photo} onClick={onPhotoClick} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
