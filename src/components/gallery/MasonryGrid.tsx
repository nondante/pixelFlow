'use client';

import { useState, useEffect, useRef } from 'react';
import { UnsplashPhoto } from '@/types/unsplash';
import { ImageCard } from './ImageCard';

interface MasonryGridProps {
  photos: UnsplashPhoto[];
  onPhotoClick?: (photo: UnsplashPhoto) => void;
}

export function MasonryGrid({ photos, onPhotoClick }: MasonryGridProps) {
  const [columns, setColumns] = useState(3);
  const prevPhotosRef = useRef<UnsplashPhoto[]>([]);
  const prevColumnsRef = useRef(columns);
  const [columnArrays, setColumnArrays] = useState<{ photo: UnsplashPhoto; originalIndex: number }[][]>([]);

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

  // Distribute photos across columns - incrementally using useEffect for better control
  useEffect(() => {
    // If columns changed or photos were replaced (search/filter), recalculate from scratch
    const photosReplaced = photos.length < prevPhotosRef.current.length ||
                           (photos.length > 0 && prevPhotosRef.current.length > 0 &&
                            photos[0].id !== prevPhotosRef.current[0].id);

    // Check if this is initial load (no previous photos)
    const isInitialLoad = prevPhotosRef.current.length === 0 && photos.length > 0;

    if (prevColumnsRef.current !== columns || photosReplaced || isInitialLoad) {
      // Full recalculation needed
      const cols: { photo: UnsplashPhoto; originalIndex: number }[][] = Array.from({ length: columns }, () => []);
      const columnHeights = new Array(columns).fill(0);

      photos.forEach((photo, index) => {
        const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights));
        cols[minHeightIndex].push({ photo, originalIndex: index });
        columnHeights[minHeightIndex] += photo.height / photo.width;
      });

      prevPhotosRef.current = photos;
      prevColumnsRef.current = columns;
      setColumnArrays(cols);
      return;
    }

    // Incremental update: only add new photos
    const newPhotos = photos.slice(prevPhotosRef.current.length);
    if (newPhotos.length === 0) {
      return;
    }

    // Update state with new photos
    setColumnArrays(prevCols => {
      // Calculate current column heights from previous state
      const columnHeights = new Array(columns).fill(0);
      prevCols.forEach((col, colIndex) => {
        col.forEach(item => {
          columnHeights[colIndex] += item.photo.height / item.photo.width;
        });
      });

      // Determine which columns will receive new photos
      const columnsToUpdate = new Set<number>();
      const tempHeights = [...columnHeights];

      newPhotos.forEach((photo) => {
        const minHeightIndex = tempHeights.indexOf(Math.min(...tempHeights));
        columnsToUpdate.add(minHeightIndex);
        tempHeights[minHeightIndex] += photo.height / photo.width;
      });

      // Create new arrays: keep same reference for unchanged columns, new reference for changed ones
      const newCols = prevCols.map((col, colIndex) => {
        if (columnsToUpdate.has(colIndex)) {
          return [...col]; // New array for columns that will receive photos
        }
        return col; // Same reference for unchanged columns
      });

      // Reset heights for actual assignment
      const assignHeights = [...columnHeights];

      // Add new photos
      newPhotos.forEach((photo, relativeIndex) => {
        const index = prevPhotosRef.current.length + relativeIndex;
        const minHeightIndex = assignHeights.indexOf(Math.min(...assignHeights));
        newCols[minHeightIndex].push({ photo, originalIndex: index });
        assignHeights[minHeightIndex] += photo.height / photo.width;
      });

      return newCols;
    });

    prevPhotosRef.current = photos;
  }, [photos, columns]);

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {columnArrays.map((columnPhotos, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4">
          {columnPhotos.map(({ photo, originalIndex }) => (
            <ImageCard
              key={photo.id}
              photo={photo}
              onClick={onPhotoClick}
              index={originalIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
