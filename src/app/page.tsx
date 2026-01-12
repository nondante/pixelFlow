'use client';

import { ImageGallery } from '@/components/gallery/ImageGallery';
import { ImageModal } from '@/components/gallery/ImageModal';
import { LayoutSwitcher } from '@/components/layout/LayoutSwitcher';
import { LayoutInitializer } from '@/components/layout/LayoutInitializer';
import { SearchBar } from '@/components/search/SearchBar';
import { CategoryChips } from '@/components/search/CategoryChips';
import { FilterPanel } from '@/components/search/FilterPanel';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FavoritesToggle } from '@/components/favorites/FavoritesToggle';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function Home() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LayoutInitializer />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={scrollToTop}
              className="text-left hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Scroll to top"
            >
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PixelFlow
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                High-Performance Image Gallery
              </p>
            </button>
            <div className="flex items-center gap-4">
              <FavoritesToggle />
              <LayoutSwitcher />
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Powered by Unsplash</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-6 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Search Bar */}
          <SearchBar />

          {/* Category Chips */}
          <CategoryChips />
        </div>
      </section>

      {/* Filter Panel */}
      <FilterPanel />

      {/* Gallery Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-950">
        <ErrorBoundary>
          <ImageGallery />
        </ErrorBoundary>
      </div>

      {/* Image Modal */}
      <ImageModal />
    </main>
  );
}
