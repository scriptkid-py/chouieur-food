/**
 * =============================================================================
 * API CONFIGURATION - CHOUIEUR EXPRESS FRONTEND
 * =============================================================================
 * 
 * This file handles API configuration for the frontend to communicate
 * with the backend server. It automatically switches between development
 * and production URLs based on environment variables.
 * 
 * TO CHANGE API URL FOR DEPLOYMENT:
 * =================================
 * 1. Set NEXT_PUBLIC_API_URL environment variable in Render dashboard
 * 2. For local development, update .env.local file
 * 3. The API_BASE_URL will automatically use the correct URL
 */

// =============================================================================
// API CONFIGURATION
// =============================================================================

/**
 * Get the base API URL for backend communication
 * 
 * Priority:
 * 1. NEXT_PUBLIC_API_URL environment variable (for production)
 * 2. Default to localhost:3001 (for development)
 * 
 * Note: We use environment variables only to avoid hydration mismatches.
 * Window-based checks happen dynamically via getApiBaseUrl() function.
 */
const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://chouieur-express-backend.onrender.com'
    : 'http://localhost:3001');

/**
 * Get the API base URL - dynamically determines the correct URL
 * This function can be called at runtime to avoid hydration mismatches
 */
export function getApiBaseUrl(): string {
  // Use environment variable if set
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // For client-side only, check for production deployments
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If not localhost, use Render backend by default
    if (!hostname.includes('localhost')) {
      return 'https://chouieur-express-backend.onrender.com';
    }
  }
  
  // Default to localhost for development
  return 'http://localhost:3001';
}

// Export a constant that's safe for SSR (uses env var only)
export const API_BASE_URL = DEFAULT_API_URL;

/**
 * API endpoints configuration
 * Uses functions to ensure dynamic URL resolution
 */
export const API_ENDPOINTS = {
  // Health check
  get HEALTH() { return `${getApiBaseUrl()}/api/health`; },
  
  // Orders
  get ORDERS() { return `${getApiBaseUrl()}/api/orders`; },
  ORDER_BY_ID: (id: string) => `${getApiBaseUrl()}/api/orders/${id}`,
  
  // Menu items
  get MENU_ITEMS() { return `${getApiBaseUrl()}/api/menu-items`; },
  MENU_ITEM: (id: string) => `${getApiBaseUrl()}/api/menu-items/${id}`,
} as const;

// =============================================================================
// API UTILITY FUNCTIONS
// =============================================================================

/**
 * Safely extract error message from unknown error
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Create a full API URL with query parameters
 */
export function createApiUrl(endpoint: string, params?: Record<string, string | number>): string {
  const url = new URL(endpoint);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  
  return url.toString();
}

/**
 * Get API configuration for debugging
 */
export function getApiConfig() {
  return {
    baseUrl: getApiBaseUrl(),
    defaultUrl: DEFAULT_API_URL,
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    hasEnvVar: !!process.env.NEXT_PUBLIC_API_URL,
  };
}

// =============================================================================
// FETCH WRAPPER WITH ERROR HANDLING
// =============================================================================

/**
 * Enhanced fetch wrapper with error handling and logging
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${getApiBaseUrl()}${endpoint}`;

  // Detect if the body is FormData
  const isFormData = options.body instanceof FormData;

  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      // Only set Content-Type for non-FormData bodies
      ...(isFormData ? {} : {'Content-Type': 'application/json'}),
      ...(options.headers || {})
    },
  };

  try {
    console.log(`🌐 API Request: ${defaultOptions.method || 'GET'} ${url}`);
    
    const response = await fetch(url, defaultOptions);
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Response error:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    // Handle empty responses (e.g., 204 No Content)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // For successful DELETE requests without a body, return a success object
      if (defaultOptions.method === 'DELETE' && response.status === 200) {
        console.log(`✅ API Response: ${url} - Deleted successfully`);
        return { success: true, message: 'Deleted successfully' } as T;
      }
      // For other empty responses, return empty object
      return {} as T;
    }
    
    // Check if there's actually content to parse
    const text = await response.text();
    if (!text || text.trim() === '') {
      console.log(`✅ API Response: ${url} - Empty response`);
      return { success: true } as T;
    }
    
    try {
      const data = JSON.parse(text);
      console.log(`✅ API Response: ${url}`, data);
      return data;
    } catch (parseError) {
      console.warn(`⚠️ Failed to parse JSON response for ${url}, returning raw text`);
      return { success: true, message: text } as T;
    }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error(`❌ API Error: ${url}`, errorMessage);
    throw new Error(errorMessage);
  }
}

// =============================================================================
// SPECIFIC API FUNCTIONS
// =============================================================================

/**
 * Health check API call
 */
export async function checkApiHealth() {
  return apiRequest<{
    status: string;
    message: string;
    timestamp: string;
    environment: string;
  }>(API_ENDPOINTS.HEALTH);
}

/**
 * Get all orders
 */
export async function getOrders() {
  return apiRequest<{
    success: boolean;
    message: string;
    orders: any[];
  }>(API_ENDPOINTS.ORDERS);
}

/**
 * Create a new order
 */
export async function createOrder(orderData: any) {
  return apiRequest<{
    success: boolean;
    message: string;
    order: any;
  }>(API_ENDPOINTS.ORDERS, {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

/**
 * Update an order
 */
export async function updateOrder(orderId: string, updates: any) {
  return apiRequest<{
    success: boolean;
    message: string;
    orderId: string;
    updates: any;
  }>(API_ENDPOINTS.ORDER_BY_ID(orderId), {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Get all menu items
 */
export async function getMenuItems(category?: string) {
  const url = category 
    ? createApiUrl(API_ENDPOINTS.MENU_ITEMS, { category })
    : API_ENDPOINTS.MENU_ITEMS;
  
  return apiRequest<{
    success: boolean;
    menuItems: any[];
  }>(url);
}

/**
 * Get a specific menu item
 */
export async function getMenuItem(id: string) {
  return apiRequest<{
    success: boolean;
    menuItem: any;
  }>(API_ENDPOINTS.MENU_ITEM(id));
}

// =============================================================================
// DEBUGGING AND DEVELOPMENT
// =============================================================================

/**
 * Log current API configuration (for debugging)
 * Only runs on client-side to avoid hydration issues
 */
export function logApiConfig() {
  if (typeof window !== 'undefined') {
    const config = getApiConfig();
    console.log('🔧 API Configuration:', config);
    console.log('📍 Current hostname:', window.location.hostname);
    return config;
  }
  return null;
}
