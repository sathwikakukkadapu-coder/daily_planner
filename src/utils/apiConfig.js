import { Capacitor } from '@capacitor/core';

const CUSTOM_API_URL_KEY = 'duo_habit_custom_api_url';

/**
 * Resolves the backend base URL.
 * Priority:
 * 1. User-configured custom URL in localStorage (if any)
 * 2. Vite environment variable: import.meta.env.VITE_API_URL
 * 3. Browser environment fallback (relative / origin)
 */
export function getBackendUrl() {
  // Check localStorage for runtime override (useful for testing on phone without rebuilding)
  try {
    const savedCustomUrl = localStorage.getItem(CUSTOM_API_URL_KEY);
    if (savedCustomUrl && savedCustomUrl.trim()) {
      return savedCustomUrl.trim().replace(/\/+$/, '');
    }
  } catch (e) {
    // ignore
  }

  // Check Vite environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // If running inside Capacitor Native App (Android/iOS) and no URL is set
  if (Capacitor.isNativePlatform()) {
    // In Android WebView, origin is https://localhost so relative URLs won't reach the Node server.
    // Return empty string so caller can warn or use offline storage until URL is configured.
    return '';
  }

  // If in web browser:
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Local development with Vite proxy: use relative path
      return '';
    }
    // Web production deployment: same origin
    return window.location.origin;
  }

  return '';
}

export function setCustomApiUrl(url) {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(CUSTOM_API_URL_KEY);
    } else {
      localStorage.setItem(CUSTOM_API_URL_KEY, url.trim().replace(/\/+$/, ''));
    }
  } catch (e) {
    console.error('Error saving custom API URL:', e);
  }
}

export function getCustomApiUrl() {
  try {
    return localStorage.getItem(CUSTOM_API_URL_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}
