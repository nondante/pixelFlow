'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Blurhash } from 'react-blurhash';
import { UnsplashPhoto } from '@/types/unsplash';
import { useGalleryStore } from '@/store/galleryStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { unsplashLoader } from '@/utils/imageLoader';
import { imagePreloader } from '@/utils/imagePreloader';

export function ImageModal() {
  const { selectedPhoto, photos, showFavoritesOnly, setSelectedPhoto } = useGalleryStore();
  const { isFavorite, toggleFavorite, favorites } = useFavoritesStore();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Use favorites array when in favorites-only mode, otherwise use photos
  const displayPhotos = showFavoritesOnly ? favorites : photos;

  // Find current photo index in the correct array
  const currentIndex = selectedPhoto
    ? displayPhotos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const isFav = selectedPhoto ? isFavorite(selectedPhoto.id) : false;

  // Navigation handlers
  const goToNext = useCallback(() => {
    if (currentIndex < displayPhotos.length - 1) {
      setSelectedPhoto(displayPhotos[currentIndex + 1]);
    }
  }, [currentIndex, displayPhotos, setSelectedPhoto]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedPhoto(displayPhotos[currentIndex - 1]);
    }
  }, [currentIndex, displayPhotos, setSelectedPhoto]);

  const closeModal = useCallback(() => {
    setSelectedPhoto(null);
  }, [setSelectedPhoto]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, closeModal, goToPrevious, goToNext]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset initial load flag when modal closes for next time
      setIsInitialLoad(true);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPhoto]);

  // Reset image loaded state when photo changes and immediately preload current image
  useEffect(() => {
    setIsImageLoaded(false);

    // Immediately start preloading the current image at 2048px
    if (selectedPhoto) {
      imagePreloader.preload(selectedPhoto.urls.regular, 2048);
    }
  }, [selectedPhoto?.id]);

  // Aggressive preloading for smooth continuous navigation
  // Preload 10 images ahead (primary direction) and 3 behind (for back navigation)
  useEffect(() => {
    if (selectedPhoto && currentIndex >= 0) {
      const imagesToPreload: string[] = [];

      // Preload next 10 images ahead (aggressive forward preloading for continuous scrolling)
      for (let i = 1; i <= 10; i++) {
        if (currentIndex + i < displayPhotos.length) {
          imagesToPreload.push(displayPhotos[currentIndex + i].urls.regular);
        }
      }

      // Preload previous 3 images (for back navigation)
      for (let i = 1; i <= 3; i++) {
        if (currentIndex - i >= 0) {
          imagesToPreload.push(displayPhotos[currentIndex - i].urls.regular);
        }
      }

      // Preload in background at fixed 2048px width to match Next.js Image request
      // This ensures continuous smooth navigation without spinners even during rapid clicking
      if (imagesToPreload.length > 0) {
        imagePreloader.preloadMultiple(imagesToPreload, 2048);
      }
    }
  }, [selectedPhoto, currentIndex, displayPhotos]);

  // Download handler
  const handleDownload = async () => {
    if (!selectedPhoto) return;

    try {
      const response = await fetch(selectedPhoto.urls.full);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unsplash-${selectedPhoto.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Share handler
  const handleShare = async () => {
    if (!selectedPhoto) return;

    const shareData = {
      title: `Photo by ${selectedPhoto.user.name}`,
      text: selectedPhoto.description || selectedPhoto.alt_description || 'Check out this photo!',
      url: selectedPhoto.links.html,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(selectedPhoto.links.html);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  return (
    <AnimatePresence>
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeModal}
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation buttons */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {currentIndex < displayPhotos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Main content */}
          <div
            className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image container */}
            <motion.div
              key={selectedPhoto.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-7xl max-h-[70vh] w-full"
              style={{
                aspectRatio: `${selectedPhoto.width} / ${selectedPhoto.height}`,
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                // Swipe threshold: 100px or velocity > 500
                if (info.offset.x > 100 || info.velocity.x > 500) {
                  goToPrevious();
                } else if (info.offset.x < -100 || info.velocity.x < -500) {
                  goToNext();
                }
              }}
            >
              {/* BlurHash Placeholder - only show on initial modal open, not during navigation */}
              {selectedPhoto.blur_hash && isInitialLoad && !isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Blurhash
                    hash={selectedPhoto.blur_hash}
                    width="100%"
                    height="100%"
                    resolutionX={32}
                    resolutionY={32}
                    punch={1}
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* Loading spinner - only show on initial modal open, not during navigation */}
              {!isImageLoaded && isInitialLoad && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}

              {/* Main Image */}
              <Image
                src={selectedPhoto.urls.regular}
                alt={selectedPhoto.alt_description || selectedPhoto.description || 'Photo'}
                fill
                loader={unsplashLoader}
                className={`object-contain transition-opacity duration-300 ease-out ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="2048px"
                priority
                quality={70}
                onLoadingComplete={() => {
                  setIsImageLoaded(true);
                  setIsInitialLoad(false); // No longer initial load after first image loads
                }}
              />
            </motion.div>

            {/* Image metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-lg p-4 md:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Author info */}
                <div className="flex items-center gap-3">
                  {selectedPhoto.user.profile_image?.medium && (
                    <img
                      src={selectedPhoto.user.profile_image.medium}
                      alt={selectedPhoto.user.name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-white font-medium">{selectedPhoto.user.name}</p>
                    {selectedPhoto.user.username && (
                      <a
                        href={`https://unsplash.com/@${selectedPhoto.user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        @{selectedPhoto.user.username}
                      </a>
                    )}
                  </div>
                </div>

                {/* Stats and actions */}
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Likes */}
                  {selectedPhoto.likes > 0 && (
                    <div className="flex items-center gap-1 text-white">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">{selectedPhoto.likes.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Dimensions */}
                  <div className="text-sm text-gray-300">
                    {selectedPhoto.width} × {selectedPhoto.height}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {/* Favorite button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedPhoto) toggleFavorite(selectedPhoto);
                      }}
                      className={`p-2 rounded-lg transition-all ${
                        isFav
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <motion.svg
                        className="w-5 h-5"
                        fill={isFav ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        animate={isFav ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </motion.svg>
                    </button>

                    <button
                      onClick={handleDownload}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                      aria-label="Download image"
                      title="Download"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={handleShare}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                      aria-label="Share image"
                      title="Share"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </button>

                    <a
                      href={selectedPhoto.links.html}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                      aria-label="View on Unsplash"
                      title="View on Unsplash"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 9V0h4v9h-4zm0 6.5V24h4v-8.5h-4zM0 13.5V19h4v-5.5H0zm20 0V19h4v-5.5h-4z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Description */}
              {(selectedPhoto.description || selectedPhoto.alt_description) && (
                <p className="mt-4 text-gray-300 text-sm">
                  {selectedPhoto.description || selectedPhoto.alt_description}
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
