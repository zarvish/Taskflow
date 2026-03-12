import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from './types/common.types';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - add request ID for tracing
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Generate unique request ID for observability
    const requestId = crypto.randomUUID();
    config.headers['X-Request-ID'] = requestId;
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        requestId,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors consistently
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`[API] Response:`, {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Structure the error consistently
    const structuredError: ApiError = {
      error: error.response?.data?.error || 'UNKNOWN_ERROR',
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      request_id: error.config?.headers?.['X-Request-ID'] as string,
      timestamp: new Date().toISOString(),
    };

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`[API] Error:`, {
        url: error.config?.url,
        status: error.response?.status,
        error: structuredError,
      });
    }

    return Promise.reject(structuredError);
  }
);
