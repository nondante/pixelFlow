'use client';

import { useEffect } from 'react';
import { useGalleryStore } from '@/store/galleryStore';
import { usePreferencesStore } from '@/store/preferencesStore';

/**
 * Component that initializes the gallery layout from user preferences
 * Must be a client component to access localStorage
 */
export function LayoutInitializer() {
  const setLayout = useGalleryStore((state) => state.setLayout);
  const preferredLayout = usePreferencesStore((state) => state.preferredLayout);

  useEffect(() => {
    // Set the layout from preferences on mount
    setLayout(preferredLayout);
  }, [preferredLayout, setLayout]);

  return null; // This component doesn't render anything
}
