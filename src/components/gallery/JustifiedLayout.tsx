'use client';

import { useState, useEffect, useRef } from 'react';
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
  const prevTargetHeightRef = useRef(targetRowHeight);
  const prevContainerWidthRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [rows, setRows] = useState<LayoutRow[]>([]);
  const [hasInitiallyRendered, setHasInitiallyRendered] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const firstPhotoIdRef = useRef<string | null>(null);

  const gap = 16;

  // Only show content when we have container width, calculated rows, and initial render is complete
  const isReady = containerWidth > 0 && rows.length > 0 && hasInitiallyRendered;

  // Track container width with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width > 0) {
          setContainerWidth(width);

          // Only set initial render flag on first measurement
          if (!hasInitiallyRendered && rows.length > 0) {
            // Clear any existing timeout
            if (resizeTimeoutRef.current) {
              clearTimeout(resizeTimeoutRef.current);
            }

            // Set rendered after a brief delay to ensure no more resizes are coming
            resizeTimeoutRef.current = setTimeout(() => {
              setHasInitiallyRendered(true);
            }, 50);
          }
        }
      }
    };

    // Use ResizeObserver for accurate container size tracking
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(containerRef.current);

    // Initial measurement after a brief delay to ensure container is rendered
    requestAnimationFrame(() => {
      updateWidth();
    });

    return () => {
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [rows.length, hasInitiallyRendered]);

  // Calculate justified layout - incrementally
  useEffect(() => {
    // Wait until container width is measured
    if (containerWidth === 0 || photos.length === 0) {
      if (photos.length === 0) setRows([]);
      return;
    }

    // Track the first photo ID to detect category changes
    const currentFirstPhotoId = photos.length > 0 ? photos[0].id : null;

    // Check if photos were replaced (search/filter/category change)
    const photosReplaced = photos.length < prevPhotosRef.current.length ||
                           (photos.length > 0 && prevPhotosRef.current.length > 0 &&
                            photos[0].id !== prevPhotosRef.current[0].id);

    // If photos were replaced, reset the render state to show loading spinner
    if (photosReplaced && firstPhotoIdRef.current !== currentFirstPhotoId) {
      setHasInitiallyRendered(false);
      firstPhotoIdRef.current = currentFirstPhotoId;
    } else if (firstPhotoIdRef.current === null && photos.length > 0) {
      // Initial load
      firstPhotoIdRef.current = currentFirstPhotoId;
    }

    // Check for initial load or settings change
    const isInitialLoad = prevPhotosRef.current.length === 0 && photos.length > 0;
    const heightChanged = prevTargetHeightRef.current !== targetRowHeight;
    const widthChanged = Math.abs(prevContainerWidthRef.current - containerWidth) > 10;

    if (photosReplaced || isInitialLoad || heightChanged || widthChanged) {
      // Full recalculation
      const newRows: LayoutRow[] = [];
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

          // For the last row, scale it up if it's reasonably full (60%+), otherwise leave at natural size
          const fillPercentage = totalWidth / containerWidth;
          const shouldScaleLastRow = isLastPhoto && fillPercentage >= 0.6;
          const finalScaleFactor = isLastPhoto && !shouldScaleLastRow ? 1 : scaleFactor;

          newRows.push({
            items: [...currentRow],
            scaleFactor: finalScaleFactor,
          });

          currentRow = [];
          currentRowWidth = 0;
        }
      });

      prevPhotosRef.current = photos;
      prevTargetHeightRef.current = targetRowHeight;
      prevContainerWidthRef.current = containerWidth;
      setRows(newRows);
      return;
    }

    // Incremental update
    const newPhotos = photos.slice(prevPhotosRef.current.length);
    if (newPhotos.length === 0) {
      return;
    }

    // Update state with new photos
    setRows(prevRows => {
      // Start with existing rows
      let newRows = [...prevRows];
      let lastRow = newRows.length > 0 ? newRows[newRows.length - 1] : null;

      // If last row was marked as "last" (scaleFactor = 1 for unfilled row), we need to recalculate it
      let currentRow: { photo: UnsplashPhoto; index: number }[] = [];
      let currentRowWidth = 0;
      const startIndex = prevPhotosRef.current.length;

      // Check if we need to rebuild the last row
      // Rebuild if it was left at natural size (scaleFactor = 1), meaning it was less than 60% full
      const shouldRebuildLastRow = lastRow && lastRow.scaleFactor === 1;

      if (shouldRebuildLastRow) {
        // Last row was sparse (<60% full), rebuild it with new photos
        newRows = newRows.slice(0, -1); // Remove last row
        currentRow = [...lastRow.items];
        currentRowWidth = currentRow.reduce((sum, item) => {
          const aspectRatio = item.photo.width / item.photo.height;
          return sum + (targetRowHeight * aspectRatio);
        }, 0);
      }

      // Add new photos
      newPhotos.forEach((photo, relativeIndex) => {
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

          // For the last row, scale it up if it's reasonably full (60%+), otherwise leave at natural size
          const fillPercentage = totalWidth / containerWidth;
          const shouldScaleLastRow = isLastPhoto && fillPercentage >= 0.6;
          const finalScaleFactor = isLastPhoto && !shouldScaleLastRow ? 1 : scaleFactor;

          newRows.push({
            items: [...currentRow],
            scaleFactor: finalScaleFactor,
          });

          currentRow = [];
          currentRowWidth = 0;
        }
      });

      return newRows;
    });

    prevPhotosRef.current = photos;
  }, [photos, targetRowHeight, containerWidth]);

  return (
    <>
      <div ref={containerRef} className="w-full flex flex-col gap-4" style={{ visibility: isReady ? 'visible' : 'hidden' }}>
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
      {!isReady && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
