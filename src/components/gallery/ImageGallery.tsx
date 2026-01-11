'use client';

import { useEffect, useCallback } from 'react';
import { useGalleryStore } from '@/store/galleryStore';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { MasonryGrid } from './MasonryGrid';
import { VirtualGrid } from './VirtualGrid';
import { JustifiedLayout } from './JustifiedLayout';
import { ImageSkeleton } from './ImageSkeleton';

export function ImageGallery() {
  const {
    photos,
    layout,
    isLoading,
    hasMore,
    error,
    page,
    searchQuery,
    filters,
    addPhotos,
    setLoading,
    setError,
    setHasMore,
    incrementPage,
    setSelectedPhoto,
  } = useGalleryStore();

  // Fetch photos from API
  const fetchPhotos = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      let url = '/api/photos';
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '30',
        order_by: filters.orderBy || 'latest',
      });

      // Use search endpoint if there's a search query
      if (searchQuery) {
        url = '/api/search';
        params.set('query', searchQuery);

        if (filters.orientation) {
          params.set('orientation', filters.orientation);
        }
        if (filters.color) {
          params.set('color', filters.color);
        }
      }

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch photos');
      }

      const newPhotos = data.data || [];

      if (newPhotos.length === 0) {
        setHasMore(false);
      } else {
        // Store will handle duplicate filtering
        addPhotos(newPhotos);
        incrementPage();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  }, [
    isLoading,
    hasMore,
    page,
    searchQuery,
    filters,
    addPhotos,
    setLoading,
    setError,
    setHasMore,
    incrementPage,
  ]);

  // Initial load and reload on search/filter change
  useEffect(() => {
    // Trigger fetch when search or filters change
    // Always fetch when page is 1 (new search/filter)
    if (page === 1) {
      fetchPhotos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters]);

  // Setup infinite scroll
  useInfiniteScroll({
    threshold: 500,
    hasMore,
    isLoading,
    onLoadMore: fetchPhotos,
  });

  return (
    <div className="w-full">
      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Photos Grid - Render based on layout */}
      {photos.length > 0 && (
        <div className="relative">
          {/* Loading overlay when refreshing */}
          {isLoading && page === 1 && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          )}

          <div className={isLoading && page === 1 ? 'opacity-30' : ''}>
            {layout === 'masonry' && (
              <MasonryGrid photos={photos} onPhotoClick={setSelectedPhoto} />
            )}
            {layout === 'grid' && (
              <VirtualGrid photos={photos} onPhotoClick={setSelectedPhoto} />
            )}
            {layout === 'justified' && (
              <JustifiedLayout photos={photos} onPhotoClick={setSelectedPhoto} />
            )}
          </div>
        </div>
      )}

      {/* Loading Skeletons - Only show when no photos */}
      {isLoading && photos.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ImageSkeleton key={i} height={200 + Math.random() * 200} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && photos.length === 0 && !error && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No photos found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && photos.length > 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>You've reached the end!</p>
        </div>
      )}
    </div>
  );
}
