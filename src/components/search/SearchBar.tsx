'use client';

import { useState, useEffect, useRef } from 'react';
import { useGalleryStore } from '@/store/galleryStore';
import { useDebounce } from '@/hooks/useDebounce';

export function SearchBar() {
  const currentQuery = useGalleryStore((state) => state.searchQuery);
  const [inputValue, setInputValue] = useState(currentQuery);
  const setSearchQuery = useGalleryStore((state) => state.setSearchQuery);
  const isUserInputRef = useRef(false);
  const initialQueryRef = useRef(currentQuery);

  // Debounce search input (300ms delay)
  const debouncedValue = useDebounce(inputValue, 300);

  // Sync input value with store when changed externally (e.g., category click)
  useEffect(() => {
    if (currentQuery !== inputValue) {
      // Update input only if this wasn't triggered by user typing
      if (!isUserInputRef.current) {
        setInputValue(currentQuery);
      }
    }
  }, [currentQuery, inputValue]);

  // Update store when debounced value changes from user input
  useEffect(() => {
    // Skip if this is the initial value
    if (debouncedValue === initialQueryRef.current) {
      return;
    }

    // Only update if the value has actually changed and it's from user input
    if (debouncedValue !== currentQuery && isUserInputRef.current) {
      setSearchQuery(debouncedValue);
    }
  }, [debouncedValue, currentQuery, setSearchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserInputRef.current = true;
    setInputValue(e.target.value);
  };

  const handleClear = () => {
    isUserInputRef.current = true;
    setInputValue('');
    setSearchQuery('');
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
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
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Search for photos... (nature, architecture, people, etc.)"
        className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-lg
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   placeholder-gray-400 dark:placeholder-gray-500
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-all"
      />

      {/* Clear Button */}
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Clear search"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
