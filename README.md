# PixelFlow - Image Gallery

A high-performance, feature-rich image gallery application built with modern web technologies. PixelFlow showcases advanced frontend development techniques including virtual scrolling, progressive image loading, and sophisticated state management.

## Features

### Core Functionality

- **Multiple Layout Options**
  - Masonry layout with intelligent column distribution
  - Virtual grid with optimized rendering
  - Justified layout for consistent row heights
  - Responsive column counts (1-5 columns based on viewport)

- **Advanced Image Loading**
  - Progressive loading with BlurHash placeholders
  - Three-stage image rendering (placeholder → thumbnail → full resolution)
  - Aggressive preloading strategy (10 images ahead, 3 behind in modal)
  - WebP format optimization with quality tuning
  - 200-item image cache with 15-minute TTL

- **Search & Filtering**
  - Real-time search with 300ms debouncing
  - Orientation filters (Landscape, Portrait, Square)
  - Color filters (11 color options including B&W)
  - Sort options (Latest, Popular, Oldest)
  - Quick-select category chips

- **Favorites System**
  - LocalStorage persistence with cross-tab synchronization
  - Fast Set-based lookups for O(1) performance
  - Dedicated favorites view
  - Heart icon toggle on photo cards

- **Full-Featured Image Modal**
  - Large display with photo metadata
  - Keyboard navigation (Arrow keys, Escape)
  - Swipe gestures for mobile
  - Download full-resolution images
  - Native share API with clipboard fallback
  - View on Unsplash link
  - Smooth preloading for instant navigation

- **Theme System**
  - Light/Dark mode toggle
  - LocalStorage persistence
  - SSR-safe implementation with flash-free loading
  - Smooth transitions between themes

- **Infinite Scroll**
  - Auto-loads more images 500px before page bottom
  - Debounced scroll detection (150ms)
  - Duplicate photo filtering
  - Loading states and "End of Results" messaging

- **Progressive Web App (PWA)**
  - Service worker with intelligent caching
  - Offline capability for browsed images
  - Installable on desktop and mobile
  - CacheFirst strategy for images (7-day cache)
  - NetworkFirst strategy for API (5-minute cache)

## Technology Stack

### Core Framework
- **Next.js 15.1.3** - React framework with SSR/SSG and API routes
- **React 18.3.1** - UI library with concurrent features
- **TypeScript 5** - Type-safe development

### State Management
- **Zustand 5.0.9** - Lightweight state management with middleware
- LocalStorage persistence with cross-tab sync
- Multiple stores for separation of concerns

### Styling & Animation
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 12.25.0** - Smooth animations and transitions
- Responsive design with mobile-first approach

### Image Processing
- **react-blurhash 0.3.0** - Progressive image placeholder rendering
- **Next.js Image Component** - Optimized image delivery
- Custom Unsplash image loader

### Performance
- **@tanstack/react-virtual 3.13.18** - Virtual scrolling for large lists
- Custom preloading queue with cache management
- Request deduplication and caching
- Debounced user inputs

### API Integration
- **axios 1.13.2** - HTTP client
- Custom UnsplashClient with rate limiting
- API response caching with 5-minute TTL
- Error handling with user-friendly messages

## Architecture Highlights

### State Management Structure
- **galleryStore** - Main gallery state (photos, filters, search, pagination)
- **favoritesStore** - Favorites management with persistence
- **themeStore** - Theme preferences with SSR safety
- **preferencesStore** - User preferences and settings

### API Routes
- `/api/photos` - Fetch curated photos with pagination
- `/api/search` - Search photos with advanced filters
- Rate limiting (50 requests/hour production, 200 development)
- Response caching and deduplication

### Custom Hooks
- `useInfiniteScroll` - Scroll detection and auto-loading
- `useDebounce` - Input debouncing for search
- `useIntersectionObserver` - Lazy image loading

### Performance Optimizations
1. Virtual scrolling for efficient rendering of large lists
2. Image cache with LRU eviction (200 items, 15-min TTL)
3. API response caching (5-min TTL)
4. Request deduplication to prevent redundant calls
5. Debounced user inputs (search, scroll)
6. Deterministic skeleton heights to prevent hydration issues
7. Aggressive modal preloading for instant navigation
8. Service worker caching for offline support

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Unsplash API access key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd imageGallery
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the root directory
```env
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
imageGallery/
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js app directory (pages and layouts)
│   ├── components/     # React components
│   │   ├── gallery/    # Gallery-related components
│   │   ├── search/     # Search and filter components
│   │   └── ui/         # Reusable UI components
│   ├── lib/            # Utility functions and API clients
│   ├── store/          # Zustand state management stores
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions and hooks
├── .env.local          # Environment variables (not in repo)
└── next.config.js      # Next.js configuration with PWA
```

## Key Features Demonstrated

### Frontend Skills
- Advanced React patterns (hooks, context, composition)
- TypeScript for type safety
- State management with Zustand
- Performance optimization techniques
- Responsive design with Tailwind CSS
- Animation with Framer Motion
- Progressive Web App implementation

### Backend Skills
- Next.js API routes
- External API integration (Unsplash)
- Rate limiting implementation
- Response caching strategies
- Error handling and recovery

### User Experience
- Keyboard navigation
- Mobile gesture support
- Loading states and skeletons
- Error messaging
- Accessibility features (ARIA labels, semantic HTML)

### Performance Engineering
- Virtual scrolling for large lists
- Image preloading and caching
- Request deduplication
- Debounced inputs
- Service worker caching
- Optimized image delivery

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## API Rate Limits

The application uses the Unsplash API with the following rate limits:
- **Production:** 50 requests per hour
- **Development:** 200 requests per hour

Rate limit status is displayed in the UI when limits are reached.

## License

This project is for portfolio demonstration purposes.

## Acknowledgments

- Images provided by [Unsplash](https://unsplash.com/)
- Icons and UI components built with Tailwind CSS
- BlurHash algorithm for progressive image loading

---

**Built with precision and performance in mind** 🚀
