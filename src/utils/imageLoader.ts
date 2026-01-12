/**
 * Custom image loader for Next.js Image component
 * Generates optimized Unsplash URLs with specific dimensions and quality
 */

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export function unsplashLoader({ src, width, quality = 70 }: ImageLoaderProps): string {
  // If it's already a full Unsplash URL, modify it
  if (src.includes('images.unsplash.com')) {
    const url = new URL(src);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('fm', 'webp'); // Use WebP format for better compression
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('auto', 'format');
    return url.toString();
  }

  return src;
}

/**
 * Get optimized image URL for different sizes
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  size: 'thumb' | 'small' | 'regular' | 'full',
  quality: number = 80
): string {
  const url = new URL(baseUrl);

  const sizeMap = {
    thumb: 200,
    small: 400,
    regular: 1080,
    full: 2400,
  };

  url.searchParams.set('w', sizeMap[size].toString());
  url.searchParams.set('q', quality.toString());
  url.searchParams.set('fm', 'webp');
  url.searchParams.set('auto', 'format');

  return url.toString();
}

/**
 * Preload image for better UX
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Calculate aspect ratio from width and height
 */
export function calculateAspectRatio(width: number, height: number): number {
  return height / width;
}

/**
 * Get responsive image width based on viewport
 */
export function getResponsiveImageWidth(): number {
  if (typeof window === 'undefined') return 400;

  const width = window.innerWidth;

  if (width < 640) return 400; // Mobile
  if (width < 768) return 600; // Small tablet
  if (width < 1024) return 800; // Tablet
  return 1080; // Desktop
}
