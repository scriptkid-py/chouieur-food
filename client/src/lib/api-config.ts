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
 * 2. Default to localhost:5000 (for development)
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  // Health check
  HEALTH: `${API_BASE_URL}/api/health`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDER_BY_ID: (id: string) => `${API_BASE_URL}/api/orders/${id}`,
  
  // Menu items (if implemented)
  MENU: `${API_BASE_URL}/api/menu`,
  MENU_ITEM: (id: string) => `${API_BASE_URL}/api/menu/${id}`,
  
  // Users (if implemented)
  USERS: `${API_BASE_URL}/api/users`,
  USER_BY_ID: (id: string) => `${API_BASE_URL}/api/users/${id}`,
} as const;

// =============================================================================
// API UTILITY FUNCTIONS
// =============================================================================

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
    baseUrl: API_BASE_URL,
    endpoints: API_ENDPOINTS,
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
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
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🌐 API Request: ${defaultOptions.method || 'GET'} ${url}`);
    
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Response: ${url}`, data);
    
    return data;
  } catch (error) {
    console.error(`❌ API Error: ${url}`, error);
    throw error;
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

// =============================================================================
// DEBUGGING AND DEVELOPMENT
// =============================================================================

/**
 * Log current API configuration (for debugging)
 */
export function logApiConfig() {
  const config = getApiConfig();
  console.log('🔧 API Configuration:', config);
  return config;
}

// Auto-log configuration in development
if (process.env.NODE_ENV === 'development') {
  logApiConfig();
}
