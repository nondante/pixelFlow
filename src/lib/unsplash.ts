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
const RATE_LIMIT = {
  maxRequests: 50, // Unsplash free tier: 50 requests per hour
  windowMs: 60 * 60 * 1000, // 1 hour
  requests: [] as number[],
};

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
   * Handle API errors
   */
  private handleError(error: AxiosError<UnsplashError>): Error {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

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
    } else if (error.request) {
      return new Error('Network error. Please check your internet connection.');
    } else {
      return new Error('An unexpected error occurred');
    }
  }

  /**
   * Fetch a list of photos
   */
  async getPhotos(params: FetchPhotosParams = {}): Promise<UnsplashPhoto[]> {
    const { page = 1, per_page = 30, order_by = 'latest' } = params;

    const response = await this.client.get<UnsplashPhoto[]>('/photos', {
      params: { page, per_page, order_by },
    });

    return response.data;
  }

  /**
   * Search for photos
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
}

// Export singleton instance
export const unsplashClient = new UnsplashClient();
