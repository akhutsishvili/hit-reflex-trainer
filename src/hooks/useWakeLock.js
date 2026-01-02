/**
 * Combat Reflex - useWakeLock Hook
 *
 * Custom React hook to prevent screen sleep during training sessions.
 * Uses the Screen Wake Lock API when available, with graceful fallback.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * @typedef {Object} WakeLockState
 * @property {boolean} isLocked - Whether the wake lock is currently active
 * @property {boolean} isSupported - Whether the Wake Lock API is supported
 * @property {() => Promise<void>} requestWakeLock - Function to request a wake lock
 * @property {() => Promise<void>} releaseWakeLock - Function to release the wake lock
 */

/**
 * Custom hook to manage screen wake lock for preventing screen sleep
 * during training sessions.
 *
 * @returns {WakeLockState} Wake lock state and control functions
 *
 * @example
 * const { isLocked, requestWakeLock, releaseWakeLock } = useWakeLock();
 *
 * // Start training
 * await requestWakeLock();
 *
 * // End training
 * await releaseWakeLock();
 */
export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockRef = useRef(null);

  /**
   * Check if the Wake Lock API is supported in the current browser
   */
  const isSupported =
    typeof window !== 'undefined' &&
    'wakeLock' in navigator;

  /**
   * Request a screen wake lock
   * Prevents the screen from dimming or locking during training
   */
  const requestWakeLock = useCallback(async () => {
    if (!isSupported) {
      console.warn('Wake Lock API is not supported in this browser');
      return;
    }

    try {
      // Release any existing wake lock first
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
      }

      // Request a new wake lock
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setIsLocked(true);

      // Listen for the wake lock being released (e.g., tab becomes hidden)
      wakeLockRef.current.addEventListener('release', () => {
        setIsLocked(false);
        wakeLockRef.current = null;
      });

      console.debug('Wake Lock acquired');
    } catch (error) {
      // Wake lock request can fail if:
      // - The document is not visible
      // - The user has denied permission
      // - The device is low on battery
      console.warn('Failed to acquire Wake Lock:', error.message);
      setIsLocked(false);
    }
  }, [isSupported]);

  /**
   * Release the screen wake lock
   * Allows the screen to dim/lock normally again
   */
  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsLocked(false);
        console.debug('Wake Lock released');
      } catch (error) {
        console.warn('Failed to release Wake Lock:', error.message);
      }
    }
  }, []);

  /**
   * Re-acquire wake lock when the page becomes visible again
   * This handles the case where the user switches tabs and comes back
   */
  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const handleVisibilityChange = async () => {
      // If we had a lock and the page becomes visible again, re-acquire it
      if (document.visibilityState === 'visible' && isLocked && !wakeLockRef.current) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupported, isLocked, requestWakeLock]);

  /**
   * Clean up wake lock when component unmounts
   */
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {
          // Ignore errors during cleanup
        });
      }
    };
  }, []);

  return {
    isLocked,
    isSupported,
    requestWakeLock,
    releaseWakeLock
  };
}

export default useWakeLock;
