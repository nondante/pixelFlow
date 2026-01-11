'use client';

import { useMemo, useRef } from 'react';
import { UnsplashPhoto } from '@/types/unsplash';
import { ImageCard } from './ImageCard';

interface JustifiedLayoutProps {
  photos: UnsplashPhoto[];
  onPhotoClick?: (photo: UnsplashPhoto) => void;
  targetRowHeight?: number;
}

interface LayoutRow {
  items: { photo: UnsplashPhoto; index: number }[];
  scaleFactor: number;
}

export function JustifiedLayout({
  photos,
  onPhotoClick,
  targetRowHeight = 250,
}: JustifiedLayoutProps) {
  const prevPhotosRef = useRef<UnsplashPhoto[]>([]);
  const cachedRowsRef = useRef<LayoutRow[]>([]);

  // Calculate justified layout - incrementally
  const rows = useMemo(() => {
    if (photos.length === 0) return [];

    const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 64 : 1200;
    const gap = 16;

    // Check if photos were replaced (search/filter change)
    const photosReplaced = photos.length < prevPhotosRef.current.length ||
                           (photos.length > 0 && prevPhotosRef.current.length > 0 &&
                            photos[0].id !== prevPhotosRef.current[0].id);

    if (photosReplaced) {
      // Full recalculation
      const rows: LayoutRow[] = [];
      let currentRow: { photo: UnsplashPhoto; index: number }[] = [];
      let currentRowWidth = 0;

      photos.forEach((photo, index) => {
        const aspectRatio = photo.width / photo.height;
        const scaledWidth = targetRowHeight * aspectRatio;

        currentRow.push({ photo, index });
        currentRowWidth += scaledWidth;

        const totalGapWidth = (currentRow.length - 1) * gap;
        const totalWidth = currentRowWidth + totalGapWidth;
        const isLastPhoto = index === photos.length - 1;
        const shouldBreak = totalWidth >= containerWidth || isLastPhoto;

        if (shouldBreak) {
          const availableWidth = containerWidth - (currentRow.length - 1) * gap;
          const scaleFactor = availableWidth / currentRowWidth;

          rows.push({
            items: [...currentRow],
            scaleFactor: isLastPhoto && totalWidth < containerWidth ? 1 : scaleFactor,
          });

          currentRow = [];
          currentRowWidth = 0;
        }
      });

      cachedRowsRef.current = rows;
      prevPhotosRef.current = photos;
      return rows;
    }

    // Incremental update
    const newPhotos = photos.slice(prevPhotosRef.current.length);
    if (newPhotos.length === 0) {
      return cachedRowsRef.current;
    }

    // Start with cached complete rows (exclude the last row which might be incomplete)
    let rows = [...cachedRowsRef.current];
    let lastRow = rows.length > 0 ? rows[rows.length - 1] : null;

    // If last row was marked as "last" (scaleFactor = 1 for unfilled row), we need to recalculate it
    let currentRow: { photo: UnsplashPhoto; index: number }[] = [];
    let currentRowWidth = 0;
    let startIndex = prevPhotosRef.current.length;

    // Check if we need to rebuild the last row
    if (lastRow && lastRow.scaleFactor === 1) {
      // Last row was incomplete, rebuild it with new photos
      rows = rows.slice(0, -1); // Remove last row
      currentRow = [...lastRow.items];
      currentRowWidth = currentRow.reduce((sum, item) => {
        const aspectRatio = item.photo.width / item.photo.height;
        return sum + (targetRowHeight * aspectRatio);
      }, 0);
    }

    // Add new photos
    const allNewPhotos = [...newPhotos];
    allNewPhotos.forEach((photo, relativeIndex) => {
      const index = startIndex + relativeIndex;
      const aspectRatio = photo.width / photo.height;
      const scaledWidth = targetRowHeight * aspectRatio;

      currentRow.push({ photo, index });
      currentRowWidth += scaledWidth;

      const totalGapWidth = (currentRow.length - 1) * gap;
      const totalWidth = currentRowWidth + totalGapWidth;
      const isLastPhoto = index === photos.length - 1;
      const shouldBreak = totalWidth >= containerWidth || isLastPhoto;

      if (shouldBreak) {
        const availableWidth = containerWidth - (currentRow.length - 1) * gap;
        const scaleFactor = availableWidth / currentRowWidth;

        rows.push({
          items: [...currentRow],
          scaleFactor: isLastPhoto && totalWidth < containerWidth ? 1 : scaleFactor,
        });

        currentRow = [];
        currentRowWidth = 0;
      }
    });

    cachedRowsRef.current = rows;
    prevPhotosRef.current = photos;
    return rows;
  }, [photos, targetRowHeight]);

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {row.items.map(({ photo, index }) => {
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
                <ImageCard photo={photo} onClick={onPhotoClick} index={index} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
