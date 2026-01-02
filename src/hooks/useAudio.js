/**
 * useAudio Hook for Combat Reflex Training App
 *
 * Provides a React-friendly interface to the audio synthesizer.
 * Handles AudioContext initialization, browser autoplay restrictions,
 * and cleanup on component unmount.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createAudioContext,
  resumeAudioContext,
  playPunchSound,
  playKickSound,
  playSessionStartSound,
  playSessionEndSound,
  playWarningSound,
  playCountdownSound
} from '../utils/audioSynthesizer';

/**
 * Custom hook for managing audio in the Combat Reflex app
 *
 * @returns {Object} Audio control interface
 * @returns {Function} returns.playPunch - Plays the punch cue sound
 * @returns {Function} returns.playKick - Plays the kick cue sound
 * @returns {Function} returns.playSessionStart - Plays the session start sound
 * @returns {Function} returns.playSessionEnd - Plays the session end sound
 * @returns {Function} returns.playWarning - Plays the 5-second warning sound
 * @returns {Function} returns.playCountdown - Plays the countdown tick sound
 * @returns {Function} returns.initAudio - Initializes audio (call on user interaction)
 * @returns {boolean} returns.isReady - Whether audio is ready to play
 *
 * @example
 * const { playPunch, playKick, initAudio, isReady } = useAudio();
 *
 * // Initialize on first user interaction (e.g., button click)
 * const handleStartSession = () => {
 *   initAudio();
 *   // ... start session logic
 * };
 *
 * // Play sounds as needed
 * const handlePunchCue = () => {
 *   if (isReady) playPunch();
 * };
 */
export function useAudio() {
  // Track the AudioContext instance
  const audioContextRef = useRef(null);

  // Track whether audio is initialized and ready
  const [isReady, setIsReady] = useState(false);

  /**
   * Initialize the AudioContext
   * Must be called from a user interaction event handler (click, touch, etc.)
   * to comply with browser autoplay policies
   */
  const initAudio = useCallback(async () => {
    try {
      // Create context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = createAudioContext();
      }

      // Resume context if suspended (browsers suspend until user interaction)
      await resumeAudioContext(audioContextRef.current);

      // Mark as ready if context is running
      if (audioContextRef.current.state === 'running') {
        setIsReady(true);
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }, []);

  /**
   * Play the punch cue sound
   * Quick, sharp square wave for punch commands
   */
  const playPunch = useCallback(() => {
    if (audioContextRef.current && isReady) {
      playPunchSound(audioContextRef.current);
    }
  }, [isReady]);

  /**
   * Play the kick cue sound
   * Deeper sine wave for kick commands
   */
  const playKick = useCallback(() => {
    if (audioContextRef.current && isReady) {
      playKickSound(audioContextRef.current);
    }
  }, [isReady]);

  /**
   * Play the session start sound
   * Two ascending tones to signal beginning
   */
  const playSessionStart = useCallback(() => {
    if (audioContextRef.current && isReady) {
      playSessionStartSound(audioContextRef.current);
    }
  }, [isReady]);

  /**
   * Play the session end sound
   * Two descending tones to signal completion
   */
  const playSessionEnd = useCallback(() => {
    if (audioContextRef.current && isReady) {
      playSessionEndSound(audioContextRef.current);
    }
  }, [isReady]);

  /**
   * Play the 5-second warning sound
   * Three quick beeps to alert approaching end
   */
  const playWarning = useCallback(() => {
    if (audioContextRef.current && isReady) {
      playWarningSound(audioContextRef.current);
    }
  }, [isReady]);

  /**
   * Play the countdown tick sound
   * Short beep for countdown (3, 2, 1)
   */
  const playCountdown = useCallback(() => {
    if (audioContextRef.current && isReady) {
      playCountdownSound(audioContextRef.current);
    }
  }, [isReady]);

  /**
   * Cleanup on unmount
   * Close the AudioContext to free system resources
   */
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        // Close the context to release audio resources
        audioContextRef.current.close().catch((error) => {
          console.error('Error closing AudioContext:', error);
        });
        audioContextRef.current = null;
      }
    };
  }, []);

  /**
   * Handle visibility changes
   * Resume audio context when page becomes visible again
   * (some browsers suspend audio when tab is hidden)
   */
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && audioContextRef.current) {
        await resumeAudioContext(audioContextRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    playPunch,
    playKick,
    playSessionStart,
    playSessionEnd,
    playWarning,
    playCountdown,
    initAudio,
    isReady
  };
}

export default useAudio;
