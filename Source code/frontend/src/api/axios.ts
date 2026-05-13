import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  console.warn("⚠️ VITE_API_URL is NOT set! Falling back to localhost for development.");
}
const BASE_URL = API_URL || 'http://localhost:5000/api';

console.log(`🚀 Prepzo API initialized at: ${BASE_URL}`);

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable sending cookies with requests (for HTTP-only tokens)
  withCredentials: true,
});

// Request interceptor for CSRF token and request ID
api.interceptors.request.use(
  (config) => {
    // Add CSRF token from cookie if available
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Add request ID for tracing
    config.headers['X-Request-ID'] = generateRequestId();
    
    // Always attach token for all requests if valid
    const token = localStorage.getItem('prepzo-token');
    // Check for "null" or "undefined" as strings which can happen on state corruption
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
    
    // Limit retry attempts to prevent infinite loops
    const maxRetries = 1;
    const retryCount = originalRequest._retryCount || 0;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry && retryCount < maxRetries) {
      // Don't retry auth endpoints (except /auth/me) - these are authentication flows
      // Auth failures here mean credentials are wrong, not that token needs refresh
      if (originalRequest.url?.includes('/auth/') && !originalRequest.url?.includes('/auth/me')) {
        clearAuthData();
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      originalRequest._retryCount = retryCount + 1;
      isRefreshing = true;
      
      try {
        // Attempt to refresh the token - send refresh token from localStorage as backup
        const refreshToken = localStorage.getItem('prepzo-refresh-token');
        const refreshResponse = await api.post('/auth/refresh', refreshToken ? { refreshToken } : {});
        
        // Store new tokens in localStorage
        if (refreshResponse.data?.accessToken) {
          localStorage.setItem('prepzo-token', refreshResponse.data.accessToken);
        }
        if (refreshResponse.data?.refreshToken) {
          localStorage.setItem('prepzo-refresh-token', refreshResponse.data.refreshToken);
        }
        
        processQueue(null);
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        clearAuthData();
        // Don't auto-redirect, let the app handle it
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle 403 CSRF token error
    if (error.response?.status === 403) {
      const errorCode = (error.response?.data as { code?: string })?.code;
      if (errorCode === 'CSRF_INVALID') {
        // Refresh CSRF token and retry
        try {
          await refreshCsrfToken();
          return api(originalRequest);
        } catch {
          // CSRF refresh failed
        }
      }
    }
    
    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || error.response.headers['Retry-After'];
      const message = (error.response.data as any)?.message || 'Too many requests';
      console.warn(`Rate limited: ${message}. Retry after: ${retryAfter || '??'}s`);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Get CSRF token from cookie
 */
function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrf-token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Refresh CSRF token from server
 */
async function refreshCsrfToken(): Promise<void> {
  await api.get('/auth/csrf-token');
}

/**
 * Generate a unique request ID for tracing
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clear all authentication data
 */
function clearAuthData(): void {
  // Clear localStorage tokens
  localStorage.removeItem('prepzo-token');
  localStorage.removeItem('prepzo-refresh-token');
  localStorage.removeItem('prepzo-auth');
  
  // Clear any session storage
  sessionStorage.clear();
}

/**
 * Secure logout - calls logout endpoint and clears data
 */
export async function secureLogout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    clearAuthData();
  }
}

/**
 * Logout from all devices
 */
export async function logoutAllDevices(): Promise<void> {
  try {
    await api.post('/auth/logout-all');
  } finally {
    clearAuthData();
  }
}

export default api;

