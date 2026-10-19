/**
 * Safe wrapper around window.localStorage to prevent crashes in environments
 * where localStorage is restricted or blocked (e.g. mobile private browsing, third-party cookie restrictions, webviews).
 */
export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Access denied or not available
    }
    return null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Access denied or quota exceeded
    }
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Access denied
    }
  }
};
