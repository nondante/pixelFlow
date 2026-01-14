import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom to trigger (in pixels)
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

/**
 * Hook to detect when user scrolls near bottom and trigger loading more content
 * Includes debouncing to prevent excessive calls
 */
export function useInfiniteScroll({
  threshold = 500,
  hasMore,
  isLoading,
  onLoadMore,
}: UseInfiniteScrollOptions): void {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  const handleScroll = useCallback(() => {
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce scroll events
    scrollTimeoutRef.current = setTimeout(() => {
      // Don't load if already loading or no more items
      if (isLoading || !hasMore) return;

      // Calculate if we're near the bottom
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      // Trigger load more if within threshold
      if (distanceFromBottom < threshold) {
        onLoadMore();
      }
    }, 150); // 150ms debounce
  }, [threshold, hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Only do initial check on first mount, not on every handleScroll change
    // This prevents duplicate fetches when search/filters change
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      // Delay initial check to allow other effects to run first
      setTimeout(() => handleScroll(), 100);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);
}
