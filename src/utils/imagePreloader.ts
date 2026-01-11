/**
 * Image preloading utilities for better performance
 */

interface PreloadedImage {
  url: string;
  timestamp: number;
}

class ImagePreloader {
  private cache: Map<string, PreloadedImage> = new Map();
  private maxCacheSize = 50;
  private maxCacheAge = 5 * 60 * 1000; // 5 minutes

  /**
   * Preload a single image
   */
  async preload(url: string): Promise<void> {
    // Skip if already cached
    if (this.cache.has(url)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.addToCache(url);
        resolve();
      };

      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${url}`));
      };

      img.src = url;
    });
  }

  /**
   * Preload multiple images
   */
  async preloadMultiple(urls: string[]): Promise<void[]> {
    return Promise.all(urls.map(url => this.preload(url).catch(() => {})));
  }

  /**
   * Add image to cache
   */
  private addToCache(url: string): void {
    // Clean old entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanCache();
    }

    this.cache.set(url, {
      url,
      timestamp: Date.now(),
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
  isCached(url: string): boolean {
    return this.cache.has(url);
  }
}

// Export singleton instance
export const imagePreloader = new ImagePreloader();
