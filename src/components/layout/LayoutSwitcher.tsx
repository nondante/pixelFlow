'use client';

import { LayoutType } from '@/types/gallery';
import { useGalleryStore } from '@/store/galleryStore';
import { usePreferencesStore } from '@/store/preferencesStore';

export function LayoutSwitcher() {
  const layout = useGalleryStore((state) => state.layout);
  const setLayout = useGalleryStore((state) => state.setLayout);
  const setPreferredLayout = usePreferencesStore((state) => state.setPreferredLayout);

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    setPreferredLayout(newLayout);
  };

  const layouts: { type: LayoutType; label: string; icon: React.ReactNode }[] = [
    {
      type: 'masonry',
      label: 'Masonry',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"
          />
        </svg>
      ),
    },
    {
      type: 'grid',
      label: 'Grid',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
          />
        </svg>
      ),
    },
    {
      type: 'justified',
      label: 'Justified',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {layouts.map((layoutOption) => (
        <button
          key={layoutOption.type}
          onClick={() => handleLayoutChange(layoutOption.type)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md transition-all
            ${
              layout === layoutOption.type
                ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
          title={layoutOption.label}
          aria-label={`Switch to ${layoutOption.label} layout`}
        >
          {layoutOption.icon}
          <span className="text-sm font-medium hidden sm:inline">
            {layoutOption.label}
          </span>
        </button>
      ))}
    </div>
  );
}
