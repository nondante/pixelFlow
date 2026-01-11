'use client';

import { useGalleryStore } from '@/store/galleryStore';
import { GalleryFilters } from '@/types/gallery';

export function FilterPanel() {
  const filters = useGalleryStore((state) => state.filters);
  const setFilters = useGalleryStore((state) => state.setFilters);
  const resetGallery = useGalleryStore((state) => state.resetGallery);

  const handleFilterChange = (filterType: keyof GalleryFilters, value: any) => {
    setFilters({ [filterType]: value });
  };

  const hasActiveFilters =
    filters.orientation !== null ||
    filters.color !== null ||
    filters.orderBy !== 'latest';

  const clearFilters = () => {
    setFilters({
      orientation: null,
      color: null,
      orderBy: 'latest',
    });
  };

  const orientations = [
    { value: 'landscape', label: 'Landscape', icon: '🏞️' },
    { value: 'portrait', label: 'Portrait', icon: '🖼️' },
    { value: 'squarish', label: 'Square', icon: '⬜' },
  ];

  const colors = [
    { value: 'black_and_white', label: 'B&W', color: '#6B7280' },
    { value: 'black', label: 'Black', color: '#000000' },
    { value: 'white', label: 'White', color: '#FFFFFF' },
    { value: 'yellow', label: 'Yellow', color: '#FCD34D' },
    { value: 'orange', label: 'Orange', color: '#FB923C' },
    { value: 'red', label: 'Red', color: '#EF4444' },
    { value: 'purple', label: 'Purple', color: '#A855F7' },
    { value: 'magenta', label: 'Magenta', color: '#EC4899' },
    { value: 'green', label: 'Green', color: '#10B981' },
    { value: 'teal', label: 'Teal', color: '#14B8A6' },
    { value: 'blue', label: 'Blue', color: '#3B82F6' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Popular' },
    { value: 'oldest', label: 'Oldest' },
  ];

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          {/* Header with Clear Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Orientation Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Orientation
            </label>
            <div className="flex flex-wrap gap-2">
              {orientations.map((orientation) => (
                <button
                  key={orientation.value}
                  onClick={() =>
                    handleFilterChange(
                      'orientation',
                      filters.orientation === orientation.value
                        ? null
                        : orientation.value
                    )
                  }
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      filters.orientation === orientation.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                    }
                  `}
                >
                  <span className="mr-2">{orientation.icon}</span>
                  {orientation.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() =>
                    handleFilterChange(
                      'color',
                      filters.color === color.value ? null : color.value
                    )
                  }
                  className={`
                    px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2
                    ${
                      filters.color === color.value
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                    }
                  `}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{
                      backgroundColor: color.color,
                      border: color.value === 'white' ? '1px solid #D1D5DB' : undefined,
                    }}
                  />
                  {color.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('orderBy', option.value)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      filters.orderBy === option.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
