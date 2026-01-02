/**
 * Combat Reflex - useLocalStorage Hook
 *
 * Custom React hook for persistent state management using localStorage.
 * Handles JSON serialization/deserialization and provides a useState-like API.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing state persisted in localStorage
 *
 * @template T
 * @param {string} key - The localStorage key to store the value under
 * @param {T} initialValue - The initial value if no stored value exists
 * @returns {[T, (value: T | ((prev: T) => T)) => void]} Tuple of [value, setValue]
 *
 * @example
 * const [settings, setSettings] = useLocalStorage('user-settings', { volume: 0.5 });
 */
export function useLocalStorage(key, initialValue) {
  // Initialize state with value from localStorage or initial value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // Parse stored JSON or return initial value if nothing stored
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error reading from localStorage, use initial value
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Wrapper around setState that also persists to localStorage
   * Supports both direct values and functional updates
   */
  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function (like useState)
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save to state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    /**
     * Handle storage events from other tabs/windows
     * @param {StorageEvent} event
     */
    const handleStorageChange = (event) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Removes a value from localStorage
 * @param {string} key - The localStorage key to remove
 */
export function removeFromStorage(key) {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }
}

/**
 * Clears all Combat Reflex related data from localStorage
 * @param {string} [prefix='combat-reflex'] - Prefix to match keys
 */
export function clearStorageByPrefix(prefix = 'combat-reflex') {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    console.warn('Error clearing storage by prefix:', error);
  }
}

export default useLocalStorage;
