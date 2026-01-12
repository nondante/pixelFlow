/**
 * Image preloading utilities for better performance
 */

interface PreloadedImage {
  url: string;
  timestamp: number;
  element: HTMLImageElement; // Keep reference to the actual loaded image
}

/**
 * Transform URL to match Next.js Image loader format
 * This ensures preloaded images match what Next.js will actually request
 */
function getOptimizedUrl(src: string, width: number = 1920, quality: number = 70): string {
  if (src.includes('images.unsplash.com')) {
    const url = new URL(src);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('fm', 'webp');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('auto', 'format');
    return url.toString();
  }
  return src;
}

class ImagePreloader {
  private cache: Map<string, PreloadedImage> = new Map();
  private loadingQueue: Set<string> = new Set();
  private maxCacheSize = 200; // Large cache for continuous navigation
  private maxCacheAge = 15 * 60 * 1000; // 15 minutes

  /**
   * Preload a single image with optimized URL
   * This actually downloads the image data into browser cache
   */
  async preload(url: string, width: number = 1920): Promise<void> {
    // Transform URL to match what Next.js will request
    const optimizedUrl = getOptimizedUrl(url, width);

    // Skip if already cached or currently loading
    if (this.cache.has(optimizedUrl) || this.loadingQueue.has(optimizedUrl)) {
      return;
    }

    this.loadingQueue.add(optimizedUrl);

    return new Promise((resolve, reject) => {
      const img = new Image();

      // Enable CORS for cross-origin images
      img.crossOrigin = 'anonymous';

      // Set high priority for faster loading
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = 'high';
      }

      img.onload = () => {
        this.loadingQueue.delete(optimizedUrl);
        this.addToCache(optimizedUrl, img);
        resolve();
      };

      img.onerror = () => {
        this.loadingQueue.delete(optimizedUrl);
        reject(new Error(`Failed to preload image: ${optimizedUrl}`));
      };

      // Setting src triggers the actual download
      img.src = optimizedUrl;
    });
  }

  /**
   * Preload multiple images in priority order
   * Loads images in parallel for maximum speed
   */
  async preloadMultiple(urls: string[], width: number = 1920): Promise<void[]> {
    // Transform all URLs first
    const optimizedUrls = urls.map(url => getOptimizedUrl(url, width));

    // Filter out already cached/loading images
    const uniqueUrls = urls.filter((url, index) => {
      const optimized = optimizedUrls[index];
      return !this.cache.has(optimized) && !this.loadingQueue.has(optimized);
    });

    // Load all in parallel for faster performance
    return Promise.all(uniqueUrls.map(url => this.preload(url, width).catch(() => {})));
  }

  /**
   * Add image to cache with the actual image element
   */
  private addToCache(url: string, element: HTMLImageElement): void {
    // Clean old entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanCache();
    }

    this.cache.set(url, {
      url,
      timestamp: Date.now(),
      element,
    });
  }

  /**
   * Remove old entries from cache
   */
  private cleanCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Remove oldest entries
    entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, Math.floor(this.maxCacheSize / 2))
      .forEach(([url]) => this.cache.delete(url));

    // Remove expired entries
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.maxCacheAge) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if image is cached
   */
  isCached(url: string, width: number = 1920): boolean {
    const optimizedUrl = getOptimizedUrl(url, width);
    return this.cache.has(optimizedUrl);
  }
}

// Export singleton instance
export const imagePreloader = new ImagePreloader();
