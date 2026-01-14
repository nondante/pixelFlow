import { create } from 'zustand';
import { UnsplashPhoto } from '@/types/unsplash';
import { LayoutType, GalleryFilters } from '@/types/gallery';

interface GalleryStore {
  // State
  photos: UnsplashPhoto[];
  layout: LayoutType;
  searchQuery: string;
  filters: GalleryFilters;
  selectedPhoto: UnsplashPhoto | null;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
  showFavoritesOnly: boolean;
  hasInitiallyLoaded: boolean;

  // Actions
  setPhotos: (photos: UnsplashPhoto[]) => void;
  addPhotos: (photos: UnsplashPhoto[]) => void;
  setLayout: (layout: LayoutType) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<GalleryFilters>) => void;
  setSelectedPhoto: (photo: UnsplashPhoto | null) => void;
  setLoading: (isLoading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setError: (error: string | null) => void;
  incrementPage: () => void;
  resetGallery: () => void;
  resetPage: () => void;
  setShowFavoritesOnly: (show: boolean) => void;
  setHasInitiallyLoaded: (hasLoaded: boolean) => void;
}

export const useGalleryStore = create<GalleryStore>((set) => ({
  // Initial state
  photos: [],
  layout: 'masonry',
  searchQuery: '',
  filters: {
    orientation: null,
    color: null,
    orderBy: 'relevant',
  },
  selectedPhoto: null,
  isLoading: false,
  hasMore: true,
  error: null,
  page: 1,
  showFavoritesOnly: false,
  hasInitiallyLoaded: false,

  // Actions
  setPhotos: (photos) => set({ photos }),

  addPhotos: (photos) =>
    set((state) => {
      // If page is 1, replace photos instead of appending (new search/filter)
      if (state.page === 1 && photos.length > 0) {
        return {
          photos: photos,
        };
      }

      // Create a Set of existing photo IDs for O(1) lookup
      const existingIds = new Set(state.photos.map((p) => p.id));

      // Filter out duplicates - both from existing photos and within the new batch
      const uniquePhotos = photos.filter((photo) => {
        if (existingIds.has(photo.id)) {
          return false;
        }
        // Add to set to check for duplicates within this batch
        existingIds.add(photo.id);
        return true;
      });

      return {
        photos: [...state.photos, ...uniquePhotos],
      };
    }),

  setLayout: (layout) => set({ layout }),

  setSearchQuery: (query) =>
    set((state) => {
      // Don't reset state if query hasn't actually changed
      if (state.searchQuery === query) {
        return state;
      }
      return {
        searchQuery: query,
        page: 1,
        // Don't clear photos - they'll be replaced when new ones load
        hasMore: true,
        hasInitiallyLoaded: false, // Reset to show loading state
      };
    }),

  setFilters: (filters) =>
    set((state) => {
      const newFilters = { ...state.filters, ...filters };
      // Don't reset state if filters haven't actually changed
      if (
        newFilters.orientation === state.filters.orientation &&
        newFilters.color === state.filters.color &&
        newFilters.orderBy === state.filters.orderBy
      ) {
        return state;
      }
      return {
        filters: newFilters,
        page: 1,
        // Don't clear photos - they'll be replaced when new ones load
        hasMore: true,
        hasInitiallyLoaded: false, // Reset to show loading state
      };
    }),

  setSelectedPhoto: (photo) => set({ selectedPhoto: photo }),

  setLoading: (isLoading) => set({ isLoading }),

  setHasMore: (hasMore) => set({ hasMore }),

  setError: (error) => set({ error, isLoading: false }),

  incrementPage: () => set((state) => ({ page: state.page + 1 })),

  resetGallery: () =>
    set({
      photos: [],
      searchQuery: '',
      filters: {
        orientation: null,
        color: null,
        orderBy: 'relevant',
      },
      page: 1,
      hasMore: true,
      error: null,
      showFavoritesOnly: false,
      hasInitiallyLoaded: false,
    }),

  resetPage: () => set({ page: 1, photos: [], hasMore: true, hasInitiallyLoaded: false }),

  setShowFavoritesOnly: (show) =>
    set({
      showFavoritesOnly: show,
      page: 1,
      hasMore: !show, // No pagination for favorites
    }),

  setHasInitiallyLoaded: (hasLoaded) => set({ hasInitiallyLoaded: hasLoaded }),
}));
