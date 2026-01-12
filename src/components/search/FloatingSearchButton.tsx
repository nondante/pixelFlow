'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { CategoryChips } from './CategoryChips';
import { useGalleryStore } from '@/store/galleryStore';
import { GalleryFilters } from '@/types/gallery';

export function FloatingSearchButton() {
  const [isExpanded, setIsExpanded] = useState(false);

  const filters = useGalleryStore((state) => state.filters);
  const setFilters = useGalleryStore((state) => state.setFilters);

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
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setIsExpanded(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            aria-label="Open search and filters"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="hidden sm:inline font-medium text-lg">Search & Filter</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 bottom-4 md:inset-x-auto md:right-6 md:bottom-6 md:w-[600px] max-h-[80vh] z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Search & Filters
                </h2>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 p-4 space-y-6">
                {/* Search Bar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <SearchBar />
                </div>

                {/* Category Chips */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categories
                  </label>
                  <CategoryChips />
                </div>

                {/* Filters */}
                <div className="space-y-4">
                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Filters
                      </label>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  {/* Orientation Filter */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
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
                            px-3 py-2 rounded-lg text-sm font-medium transition-all
                            ${
                              filters.orientation === orientation.value
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          <span className="mr-1">{orientation.icon}</span>
                          {orientation.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Filter */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
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
                            px-2 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2
                            ${
                              filters.color === color.value
                                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
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
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
