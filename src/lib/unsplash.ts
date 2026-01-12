import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  UnsplashPhoto,
  UnsplashSearchResponse,
  UnsplashCollection,
  FetchPhotosParams,
  SearchPhotosParams,
  RandomPhotosParams,
  UnsplashError,
} from '@/types/unsplash';

const UNSPLASH_API_URL = 'https://api.unsplash.com';
const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

// Rate limiting configuration
// For development: More lenient limit to avoid blocking during testing
// For production: Use actual Unsplash limits
const isDevelopment = process.env.NODE_ENV === 'development';

const RATE_LIMIT = {
  maxRequests: isDevelopment ? 200 : 50, // Dev: 200/hour, Prod: 50/hour (Unsplash free tier)
  windowMs: 60 * 60 * 1000, // 1 hour
  requests: [] as number[],
};

// API Response Cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const API_CACHE = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class UnsplashClient {
  private client: AxiosInstance;

  constructor() {
    if (!ACCESS_KEY) {
      throw new Error('Unsplash access key is not configured');
    }

    this.client = axios.create({
      baseURL: UNSPLASH_API_URL,
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    });

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(
      (config) => {
        this.checkRateLimit();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        this.trackRequest();
        return response;
      },
      (error: AxiosError<UnsplashError>) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Check if we're within rate limits
   */
  private checkRateLimit(): void {
    const now = Date.now();
    // Remove requests outside the current window
    RATE_LIMIT.requests = RATE_LIMIT.requests.filter(
      (timestamp) => now - timestamp < RATE_LIMIT.windowMs
    );

    if (RATE_LIMIT.requests.length >= RATE_LIMIT.maxRequests) {
      const oldestRequest = RATE_LIMIT.requests[0];
      const resetTime = oldestRequest + RATE_LIMIT.windowMs;
      const waitTime = Math.ceil((resetTime - now) / 1000);

      if (isDevelopment) {
        console.warn(
          `⚠️ Rate limit reached (${RATE_LIMIT.requests.length}/${RATE_LIMIT.maxRequests}). ` +
          `Clearing old requests for development...`
        );
        // In development, clear old requests more aggressively
        RATE_LIMIT.requests = RATE_LIMIT.requests.filter(
          (timestamp) => now - timestamp < 5 * 60 * 1000 // Keep only last 5 minutes
        );
        return; // Allow the request to proceed
      }

      throw new Error(
        `Rate limit exceeded. Please try again in ${waitTime} seconds.`
      );
    }
  }

  /**
   * Track API request for rate limiting
   */
  private trackRequest(): void {
    RATE_LIMIT.requests.push(Date.now());
  }

  /**
   * Generate cache key from endpoint and params
   */
  private getCacheKey(endpoint: string, params: any): string {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  /**
   * Get data from cache if available and not expired
   */
  private getFromCache<T>(key: string): T | null {
    const entry = API_CACHE.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION) {
      API_CACHE.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Save data to cache
   */
  private saveToCache<T>(key: string, data: T): void {
    // Clean old cache entries if cache is too large
    if (API_CACHE.size > 50) {
      const now = Date.now();
      for (const [cacheKey, entry] of API_CACHE.entries()) {
        if (now - entry.timestamp > CACHE_DURATION) {
          API_CACHE.delete(cacheKey);
        }
      }
    }

    API_CACHE.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError<UnsplashError> | Error): Error {
    // Handle non-Axios errors (like rate limit errors)
    if (!(error as AxiosError).isAxiosError) {
      return error as Error;
    }

    const axiosError = error as AxiosError<UnsplashError>;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data;

      switch (status) {
        case 401:
          return new Error('Invalid Unsplash API credentials');
        case 403:
          return new Error('Access forbidden. Check your API key permissions.');
        case 404:
          return new Error('Resource not found');
        case 429:
          return new Error('Rate limit exceeded. Please try again later.');
        case 500:
        case 503:
          return new Error('Unsplash service is temporarily unavailable');
        default:
          if (data?.errors) {
            return new Error(data.errors.join(', '));
          }
          return new Error(`API error: ${status}`);
      }
    } else if (axiosError.request) {
      return new Error('Network error. Please check your internet connection.');
    } else {
      console.error('Unexpected error details:', error);
      return new Error(`An unexpected error occurred: ${axiosError.message || 'Unknown error'}`);
    }
  }

  /**
   * Fetch a list of photos (with caching)
   */
  async getPhotos(params: FetchPhotosParams = {}): Promise<UnsplashPhoto[]> {
    const { page = 1, per_page = 30, order_by = 'latest' } = params;
    const cacheKey = this.getCacheKey('/photos', { page, per_page, order_by });

    // Check cache first
    const cached = this.getFromCache<UnsplashPhoto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.client.get<UnsplashPhoto[]>('/photos', {
      params: { page, per_page, order_by },
    });

    // Save to cache
    this.saveToCache(cacheKey, response.data);
    return response.data;
  }

  /**
   * Search for photos (with caching)
   */
  async searchPhotos(params: SearchPhotosParams): Promise<UnsplashSearchResponse> {
    const {
      query,
      page = 1,
      per_page = 30,
      order_by = 'relevant',
      orientation,
      color,
    } = params;

    const cacheKey = this.getCacheKey('/search/photos', {
      query,
      page,
      per_page,
      order_by,
      orientation,
      color,
    });

    // Check cache first
    const cached = this.getFromCache<UnsplashSearchResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.client.get<UnsplashSearchResponse>('/search/photos', {
      params: {
        query,
        page,
        per_page,
        order_by,
        orientation,
        color,
      },
    });

    // Save to cache
    this.saveToCache(cacheKey, response.data);
    return response.data;
  }

  /**
   * Get random photos
   */
  async getRandomPhotos(params: RandomPhotosParams = {}): Promise<UnsplashPhoto[]> {
    const { count = 30, query, orientation, collections } = params;

    const response = await this.client.get<UnsplashPhoto | UnsplashPhoto[]>(
      '/photos/random',
      {
        params: { count, query, orientation, collections },
      }
    );

    // Unsplash returns a single object if count=1, array otherwise
    return Array.isArray(response.data) ? response.data : [response.data];
  }

  /**
   * Get a single photo by ID
   */
  async getPhoto(id: string): Promise<UnsplashPhoto> {
    const response = await this.client.get<UnsplashPhoto>(`/photos/${id}`);
    return response.data;
  }

  /**
   * Get photos from a collection
   */
  async getCollectionPhotos(
    collectionId: string,
    params: FetchPhotosParams = {}
  ): Promise<UnsplashPhoto[]> {
    const { page = 1, per_page = 30 } = params;

    const response = await this.client.get<UnsplashPhoto[]>(
      `/collections/${collectionId}/photos`,
      {
        params: { page, per_page },
      }
    );

    return response.data;
  }

  /**
   * Get a list of collections
   */
  async getCollections(params: FetchPhotosParams = {}): Promise<UnsplashCollection[]> {
    const { page = 1, per_page = 10 } = params;

    const response = await this.client.get<UnsplashCollection[]>('/collections', {
      params: { page, per_page },
    });

    return response.data;
  }

  /**
   * Track download (required by Unsplash API guidelines)
   */
  async trackDownload(downloadLocation: string): Promise<void> {
    try {
      await axios.get(downloadLocation);
    } catch (error) {
      console.error('Failed to track download:', error);
    }
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): { remaining: number; resetsIn: number } {
    const now = Date.now();
    const validRequests = RATE_LIMIT.requests.filter(
      (timestamp) => now - timestamp < RATE_LIMIT.windowMs
    );

    const remaining = RATE_LIMIT.maxRequests - validRequests.length;
    const oldestRequest = validRequests[0];
    const resetsIn = oldestRequest
      ? Math.ceil((oldestRequest + RATE_LIMIT.windowMs - now) / 1000)
      : 0;

    return { remaining, resetsIn };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: number } {
    const now = Date.now();
    let validEntries = 0;

    for (const [key, entry] of API_CACHE.entries()) {
      if (now - entry.timestamp <= CACHE_DURATION) {
        validEntries++;
      }
    }

    return {
      size: API_CACHE.size,
      entries: validEntries,
    };
  }

  /**
   * Clear API cache
   */
  clearCache(): void {
    API_CACHE.clear();
  }
}

// Export singleton instance
export const unsplashClient = new UnsplashClient();
