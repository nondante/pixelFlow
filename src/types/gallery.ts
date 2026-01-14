import { UnsplashPhoto } from './unsplash';

// Gallery Layout Types
export type LayoutType = 'masonry' | 'grid' | 'justified';

// Filter Types
export interface GalleryFilters {
  orientation?: 'landscape' | 'portrait' | 'squarish' | null;
  color?: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue' | null;
}

// Gallery State
export interface GalleryState {
  photos: UnsplashPhoto[];
  layout: LayoutType;
  searchQuery: string;
  filters: GalleryFilters;
  selectedPhoto: UnsplashPhoto | null;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
}

// Image Loading States
export type ImageLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// Progressive Image Loading
export interface ProgressiveImageState {
  placeholder: string; // BlurHash or base64
  thumbnail: string | null;
  full: string | null;
  loadingState: ImageLoadingState;
}

// Virtualization Types
export interface VirtualItem {
  key: string;
  index: number;
  photo: UnsplashPhoto;
  columnIndex: number;
}

// Masonry Column
export interface MasonryColumn {
  items: UnsplashPhoto[];
  height: number;
}
