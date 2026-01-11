// Unsplash API Type Definitions

export interface UnsplashUser {
  id: string;
  username: string;
  name: string;
  first_name: string;
  last_name: string | null;
  portfolio_url: string | null;
  bio: string | null;
  location: string | null;
  total_likes: number;
  total_photos: number;
  total_collections: number;
  profile_image: {
    small: string;
    medium: string;
    large: string;
  };
  links: {
    self: string;
    html: string;
    photos: string;
    likes: string;
    portfolio: string;
  };
}

export interface UnsplashUrls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
}

export interface UnsplashLinks {
  self: string;
  html: string;
  download: string;
  download_location: string;
}

export interface UnsplashPhoto {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  downloads: number;
  likes: number;
  liked_by_user: boolean;
  description: string | null;
  alt_description: string | null;
  urls: UnsplashUrls;
  links: UnsplashLinks;
  user: UnsplashUser;
  exif?: {
    make: string | null;
    model: string | null;
    exposure_time: string | null;
    aperture: string | null;
    focal_length: string | null;
    iso: number | null;
  };
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export interface UnsplashCollection {
  id: string;
  title: string;
  description: string | null;
  published_at: string;
  updated_at: string;
  curated: boolean;
  featured: boolean;
  total_photos: number;
  private: boolean;
  share_key: string;
  cover_photo: UnsplashPhoto;
  user: UnsplashUser;
  links: {
    self: string;
    html: string;
    photos: string;
  };
}

// API Request Parameters
export interface FetchPhotosParams {
  page?: number;
  per_page?: number;
  order_by?: 'latest' | 'oldest' | 'popular';
}

export interface SearchPhotosParams extends FetchPhotosParams {
  query: string;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  color?: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue';
}

export interface RandomPhotosParams {
  count?: number;
  query?: string;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  collections?: string;
}

// API Error Response
export interface UnsplashError {
  errors: string[];
}
