'use client';

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useGalleryStore } from '@/store/galleryStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { MasonryGrid } from './MasonryGrid';
import { VirtualGrid } from './VirtualGrid';
import { JustifiedLayout } from './JustifiedLayout';
import { ImageSkeleton } from './ImageSkeleton';
import { requestCache, createCacheKey } from '@/utils/requestCache';

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
    showFavoritesOnly,
    hasInitiallyLoaded,
    addPhotos,
    setLoading,
    setError,
    setHasMore,
    incrementPage,
    setSelectedPhoto,
    setHasInitiallyLoaded,
  } = useGalleryStore();

  const { favorites } = useFavoritesStore();

  // Ref to prevent race conditions when multiple fetches are triggered
  const isFetchingRef = useRef(false);

  // Determine which photos to display
  const displayPhotos = useMemo(() => {
    return showFavoritesOnly ? favorites : photos;
  }, [showFavoritesOnly, favorites, photos]);

  // Fetch photos from API
  const fetchPhotos = useCallback(async () => {
    // Skip API calls if showing favorites
    if (showFavoritesOnly || isLoading || !hasMore) return;

    // Prevent race conditions - don't start a new fetch if one is already in progress
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      // Use search API with generic query when no search term provided
      const url = '/api/search';

      const params: Record<string, string> = {
        page: page.toString(),
        per_page: '30',
        order_by: 'latest',
        query: searchQuery || 'wallpaper',
      };

      // Add filters
      if (filters.orientation) {
        params.orientation = filters.orientation;
      }
      if (filters.color) {
        params.color = filters.color;
      }

      // Create cache key for request deduplication
      const cacheKey = createCacheKey(url, params);

      // Use request cache to deduplicate and cache responses
      const data = await requestCache.get(
        cacheKey,
        async () => {
          const queryParams = new URLSearchParams(params);
          const response = await fetch(`${url}?${queryParams.toString()}`);
          return response.json();
        },
        { ttl: 2 * 60 * 1000 } // Cache for 2 minutes
      );

      if (!data.success) {
        const errorMsg = data.error || 'Failed to fetch photos';
        if (errorMsg.toLowerCase().includes('forbidden') ||
            errorMsg.toLowerCase().includes('api key') ||
            errorMsg.toLowerCase().includes('rate limit')) {
          throw new Error('API_LIMIT:We\'ve reached our photo limit for now. Please try again in a few moments!');
        }
        throw new Error(errorMsg);
      }

      const newPhotos = data.data || [];

      if (newPhotos.length === 0) {
        setHasMore(false);
      } else {
        // Store will handle duplicate filtering
        addPhotos(newPhotos);
        incrementPage();
      }

      // Mark as initially loaded after first successful fetch
      if (!hasInitiallyLoaded) {
        setHasInitiallyLoaded(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching photos:', err);
      // Mark as initially loaded even on error to show error state instead of spinner
      if (!hasInitiallyLoaded) {
        setHasInitiallyLoaded(true);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [
    showFavoritesOnly,
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
    hasInitiallyLoaded,
    setHasInitiallyLoaded,
  ]);

  // Initial load and reload on search/filter change
  useEffect(() => {
    // Reset fetching flag when search or filters change to allow fresh fetches
    isFetchingRef.current = false;

    // Trigger fetch when search or filters change
    // Always fetch when page is 1 (new search/filter)
    if (page === 1) {
      fetchPhotos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters.orientation, filters.color]);

  // Setup infinite scroll
  useInfiniteScroll({
    threshold: 500,
    hasMore,
    isLoading,
    onLoadMore: fetchPhotos,
  });

  const isApiLimitError = error?.startsWith('API_LIMIT:');
  const displayError = isApiLimitError && error ? error.replace('API_LIMIT:', '') : error;

  return (
    <div className="w-full">
      {/* Error State */}
      {error && (
        <div className={`${
          isApiLimitError
            ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        } rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-2">
            <svg
              className={`w-5 h-5 ${
                isApiLimitError
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {isApiLimitError ? (
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            <p className={`${
              isApiLimitError
                ? 'text-orange-800 dark:text-orange-200'
                : 'text-red-800 dark:text-red-200'
            }`}>{displayError}</p>
          </div>
        </div>
      )}

      {/* Photos Grid - Render based on layout */}
      {displayPhotos.length > 0 && (
        <div className="relative">
          {/* Loading overlay when refreshing */}
          {isLoading && page === 1 && !showFavoritesOnly && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          )}

          <div
            key={layout}
            className={`transition-opacity duration-300 ${isLoading && page === 1 && !showFavoritesOnly ? 'opacity-30' : ''}`}
          >
            {layout === 'masonry' && (
              <MasonryGrid photos={displayPhotos} onPhotoClick={setSelectedPhoto} />
            )}
            {layout === 'grid' && (
              <VirtualGrid photos={displayPhotos} onPhotoClick={setSelectedPhoto} />
            )}
            {layout === 'justified' && (
              <JustifiedLayout photos={displayPhotos} onPhotoClick={setSelectedPhoto} />
            )}
          </div>
        </div>
      )}

      {/* Loading Skeletons - Show on initial load or when no photos yet */}
      {!hasInitiallyLoaded && displayPhotos.length === 0 && !showFavoritesOnly && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
          {Array.from({ length: 10 }).map((_, i) => {
            // Use deterministic heights based on index to avoid hydration mismatch
            const heights = [280, 320, 300, 350, 270, 310, 340, 290, 330, 260];
            return <ImageSkeleton key={i} height={heights[i]} />;
          })}
        </div>
      )}

      {/* Empty State - Only show after initial load completes */}
      {hasInitiallyLoaded && !isLoading && displayPhotos.length === 0 && !error && (
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
            {showFavoritesOnly ? 'No favorites yet' : 'No photos found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {showFavoritesOnly
              ? 'Start favoriting photos by clicking the heart icon'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      )}

      {/* Infinite Scroll Loading Spinner */}
      {isLoading && displayPhotos.length > 0 && hasMore && !showFavoritesOnly && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading more photos...</p>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && displayPhotos.length > 0 && !showFavoritesOnly && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>You've reached the end!</p>
        </div>
      )}
    </div>
  );
}
