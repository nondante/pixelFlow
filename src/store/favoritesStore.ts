import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UnsplashPhoto } from '@/types/unsplash';

interface FavoritesState {
  favorites: UnsplashPhoto[];
  favoriteIds: Set<string>;

  // Actions
  addFavorite: (photo: UnsplashPhoto) => void;
  removeFavorite: (photoId: string) => void;
  toggleFavorite: (photo: UnsplashPhoto) => void;
  isFavorite: (photoId: string) => boolean;
  clearFavorites: () => void;
  setFavorites: (favorites: UnsplashPhoto[]) => void;
}

// Dummy storage for SSR
const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      favoriteIds: new Set(),

      addFavorite: (photo) =>
        set((state) => {
          // Don't add if already favorited
          if (state.favoriteIds.has(photo.id)) {
            return state;
          }

          const newFavorites = [photo, ...state.favorites];
          const newFavoriteIds = new Set(state.favoriteIds);
          newFavoriteIds.add(photo.id);

          return {
            favorites: newFavorites,
            favoriteIds: newFavoriteIds,
          };
        }),

      removeFavorite: (photoId) =>
        set((state) => {
          const newFavorites = state.favorites.filter((p) => p.id !== photoId);
          const newFavoriteIds = new Set(state.favoriteIds);
          newFavoriteIds.delete(photoId);

          return {
            favorites: newFavorites,
            favoriteIds: newFavoriteIds,
          };
        }),

      toggleFavorite: (photo) => {
        const state = get();
        if (state.favoriteIds.has(photo.id)) {
          state.removeFavorite(photo.id);
        } else {
          state.addFavorite(photo);
        }
      },

      isFavorite: (photoId) => {
        return get().favoriteIds.has(photoId);
      },

      clearFavorites: () =>
        set({
          favorites: [],
          favoriteIds: new Set(),
        }),

      setFavorites: (favorites) =>
        set({
          favorites,
          favoriteIds: new Set(favorites.map((p) => p.id)),
        }),
    }),
    {
      name: 'pixelflow-favorites',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : dummyStorage
      ),
      // Custom serializer to handle Set
      partialize: (state) => ({
        favorites: state.favorites,
        // Store favoriteIds as array for serialization
        favoriteIds: Array.from(state.favoriteIds),
      }),
      // Custom deserializer to restore Set
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert array back to Set
          state.favoriteIds = new Set(
            (state.favoriteIds as unknown as string[]) || []
          );
        }
      },
    }
  )
);

// Cross-tab sync using storage events
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'pixelflow-favorites' && event.newValue) {
      try {
        const newState = JSON.parse(event.newValue);
        const store = useFavoritesStore.getState();

        // Update state with data from other tab
        if (newState.state && newState.state.favorites) {
          store.setFavorites(newState.state.favorites);
        }
      } catch (error) {
        console.error('Error syncing favorites across tabs:', error);
      }
    }
  });
}
