'use client';

import { useGalleryStore } from '@/store/galleryStore';

export function CategoryChips() {
  const searchQuery = useGalleryStore((state) => state.searchQuery);
  const setSearchQuery = useGalleryStore((state) => state.setSearchQuery);

  const categories = [
    { id: 'nature', label: 'Nature', emoji: '🌿', query: 'nature' },
    { id: 'architecture', label: 'Architecture', emoji: '🏛️', query: 'architecture' },
    { id: 'people', label: 'People', emoji: '👥', query: 'people' },
    { id: 'animals', label: 'Animals', emoji: '🐾', query: 'animals' },
    { id: 'food', label: 'Food', emoji: '🍔', query: 'food' },
    { id: 'travel', label: 'Travel', emoji: '✈️', query: 'travel' },
    { id: 'technology', label: 'Technology', emoji: '💻', query: 'technology' },
    { id: 'art', label: 'Art', emoji: '🎨', query: 'art' },
    { id: 'sports', label: 'Sports', emoji: '⚽', query: 'sports' },
    { id: 'business', label: 'Business', emoji: '💼', query: 'business' },
  ];

  const handleCategoryClick = (query: string) => {
    // Toggle category - if already selected, clear it
    if (searchQuery === query) {
      setSearchQuery('');
    } else {
      setSearchQuery(query);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = searchQuery === category.query;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.query)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-colors duration-200 border
                ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg border-transparent'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md'
                }
              `}
            >
              <span className="text-lg">{category.emoji}</span>
              <span className="whitespace-nowrap">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
