/**
 * Combat Reflex - useTrainingSession Hook
 *
 * Main training loop hook that manages the state machine for training sessions.
 * Handles timing, action generation, and phase transitions.
 *
 * State Machine Flow:
 * IDLE -> COUNTDOWN -> TRAINING -> MID_REST -> TRAINING -> SESSION_END -> BREAK -> (repeat) -> COMPLETE
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTraining, TRAINING_PHASES } from '../context/TrainingContext';
import {
  getRandomInterval,
  MID_REST_DURATION_MS,
  BREAK_DURATION_MS
} from '../utils/difficultyConfig';

/**
 * Action types for punches and kicks
 * @readonly
 */
const PUNCH_ACTIONS = ['jab', 'cross', 'hook', 'uppercut'];
const KICK_ACTIONS = ['front-kick', 'roundhouse', 'side-kick', 'back-kick'];

/**
 * Countdown duration before training starts (in seconds)
 */
const COUNTDOWN_SECONDS = 3;

/**
 * @typedef {Object} TrainingSessionState
 * @property {string} state - Current training phase
 * @property {string|null} currentAction - Current action to perform (punch/kick type)
 * @property {number} hitsCompleted - Number of hits completed in current session
 * @property {number} timeRemaining - Time remaining in current phase (ms)
 * @property {number} countdownValue - Countdown value (3, 2, 1)
 * @property {() => void} startTraining - Function to start training
 * @property {() => void} stopTraining - Function to stop training
 * @property {() => void} pauseTraining - Function to pause training
 * @property {() => void} resumeTraining - Function to resume training
 */

/**
 * Custom hook for managing the training session state machine
 *
 * @param {Object} options - Configuration options
 * @param {Function} [options.onAction] - Callback when a new action is triggered
 * @param {Function} [options.onCountdown] - Callback during countdown
 * @param {Function} [options.onPhaseChange] - Callback when phase changes
 * @param {Function} [options.onSessionComplete] - Callback when a session completes
 * @param {Function} [options.onTrainingComplete] - Callback when all sessions complete
 * @returns {TrainingSessionState} Training session state and controls
 */
export function useTrainingSession({
  onAction,
  onCountdown,
  onPhaseChange,
  onSessionComplete,
  onTrainingComplete
} = {}) {
  // Get training configuration from context
  const {
    mode,
    difficulty,
    numberOfSessions,
    phase,
    currentSession,
    hitsCompleted,
    setPhase,
    incrementSession,
    incrementHits,
    resetSession,
    resetAll,
    addToHistory
  } = useTraining();

  // Local state
  const [currentAction, setCurrentAction] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [countdownValue, setCountdownValue] = useState(COUNTDOWN_SECONDS);
  const [isPaused, setIsPaused] = useState(false);

  // Refs for timing
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const sessionStartTimeRef = useRef(null);
  const midRestTriggeredRef = useRef(false);

  /**
   * Get available actions based on training mode
   * @returns {string[]} Array of available action names
   */
  const getAvailableActions = useCallback(() => {
    switch (mode) {
      case 'punches':
        return PUNCH_ACTIONS;
      case 'kicks':
        return KICK_ACTIONS;
      case 'both':
      default:
        return [...PUNCH_ACTIONS, ...KICK_ACTIONS];
    }
  }, [mode]);

  /**
   * Get a random action from available actions
   * @returns {string} Random action name
   */
  const getRandomAction = useCallback(() => {
    const actions = getAvailableActions();
    return actions[Math.floor(Math.random() * actions.length)];
  }, [getAvailableActions]);

  /**
   * Clear all active timers
   */
  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Schedule the next action with randomized timing
   */
  const scheduleNextAction = useCallback(() => {
    if (phase !== TRAINING_PHASES.TRAINING || isPaused) return;

    const interval = getRandomInterval(difficulty);

    timeoutRef.current = setTimeout(() => {
      // Check if we should trigger mid-rest
      const midRestThreshold = Math.floor(difficulty.totalHits / 2);
      if (!midRestTriggeredRef.current && hitsCompleted >= midRestThreshold) {
        midRestTriggeredRef.current = true;
        setPhase(TRAINING_PHASES.MID_REST);
        setCurrentAction(null);
        return;
      }

      // Check if session is complete
      if (hitsCompleted >= difficulty.totalHits) {
        handleSessionComplete();
        return;
      }

      // Trigger next action
      const action = getRandomAction();
      setCurrentAction(action);
      incrementHits();
      onAction?.(action);

      // Schedule the next action
      scheduleNextAction();
    }, interval);
  }, [phase, isPaused, difficulty, hitsCompleted, getRandomAction, incrementHits, onAction, setPhase]);

  /**
   * Handle completion of a single session
   */
  const handleSessionComplete = useCallback(() => {
    clearTimers();
    const endTime = Date.now();
    const durationMs = endTime - sessionStartTimeRef.current;

    // Add to history
    addToHistory({
      mode,
      difficultyId: difficulty.id,
      hitsCompleted,
      totalHits: difficulty.totalHits,
      durationMs,
      sessionNumber: currentSession,
      totalSessions: numberOfSessions
    });

    onSessionComplete?.({
      sessionNumber: currentSession,
      hitsCompleted,
      totalHits: difficulty.totalHits,
      durationMs
    });

    setCurrentAction(null);
    setPhase(TRAINING_PHASES.SESSION_END);
  }, [
    clearTimers,
    addToHistory,
    mode,
    difficulty,
    hitsCompleted,
    currentSession,
    numberOfSessions,
    onSessionComplete,
    setPhase
  ]);

  /**
   * Start the countdown phase
   */
  const startCountdown = useCallback(() => {
    setCountdownValue(COUNTDOWN_SECONDS);
    setPhase(TRAINING_PHASES.COUNTDOWN);
    onPhaseChange?.(TRAINING_PHASES.COUNTDOWN);

    let count = COUNTDOWN_SECONDS;
    onCountdown?.(count);

    intervalRef.current = setInterval(() => {
      count -= 1;
      setCountdownValue(count);
      onCountdown?.(count);

      if (count <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        startTrainingPhase();
      }
    }, 1000);
  }, [setPhase, onPhaseChange, onCountdown]);

  /**
   * Start the active training phase
   */
  const startTrainingPhase = useCallback(() => {
    sessionStartTimeRef.current = Date.now();
    midRestTriggeredRef.current = false;
    resetSession();
    setPhase(TRAINING_PHASES.TRAINING);
    onPhaseChange?.(TRAINING_PHASES.TRAINING);

    // Trigger first action immediately
    const action = getRandomAction();
    setCurrentAction(action);
    incrementHits();
    onAction?.(action);

    // Schedule subsequent actions
    scheduleNextAction();
  }, [resetSession, setPhase, onPhaseChange, getRandomAction, incrementHits, onAction, scheduleNextAction]);

  /**
   * Start mid-rest period
   */
  const startMidRest = useCallback(() => {
    clearTimers();
    setTimeRemaining(MID_REST_DURATION_MS);
    onPhaseChange?.(TRAINING_PHASES.MID_REST);

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          // Resume training after mid-rest
          setPhase(TRAINING_PHASES.TRAINING);
          scheduleNextAction();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }, [clearTimers, onPhaseChange, setPhase, scheduleNextAction]);

  /**
   * Start break between sessions
   */
  const startBreak = useCallback(() => {
    clearTimers();
    setTimeRemaining(BREAK_DURATION_MS);
    setPhase(TRAINING_PHASES.BREAK);
    onPhaseChange?.(TRAINING_PHASES.BREAK);

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          // Start next session
          incrementSession();
          resetSession();
          startCountdown();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }, [clearTimers, setPhase, onPhaseChange, incrementSession, resetSession, startCountdown]);

  /**
   * Start a new training session
   */
  const startTraining = useCallback(() => {
    resetAll();
    startCountdown();
  }, [resetAll, startCountdown]);

  /**
   * Stop training and return to idle
   */
  const stopTraining = useCallback(() => {
    clearTimers();
    setCurrentAction(null);
    setIsPaused(false);
    resetAll();
  }, [clearTimers, resetAll]);

  /**
   * Pause the current training
   */
  const pauseTraining = useCallback(() => {
    if (phase === TRAINING_PHASES.TRAINING) {
      clearTimers();
      setIsPaused(true);
    }
  }, [phase, clearTimers]);

  /**
   * Resume paused training
   */
  const resumeTraining = useCallback(() => {
    if (isPaused && phase === TRAINING_PHASES.TRAINING) {
      setIsPaused(false);
      scheduleNextAction();
    }
  }, [isPaused, phase, scheduleNextAction]);

  /**
   * Proceed to next session or complete training
   */
  const proceedFromSessionEnd = useCallback(() => {
    if (currentSession >= numberOfSessions) {
      // All sessions complete
      setPhase(TRAINING_PHASES.COMPLETE);
      onPhaseChange?.(TRAINING_PHASES.COMPLETE);
      onTrainingComplete?.();
    } else {
      // Start break before next session
      startBreak();
    }
  }, [currentSession, numberOfSessions, setPhase, onPhaseChange, onTrainingComplete, startBreak]);

  /**
   * Skip the break and start next session immediately
   */
  const skipBreak = useCallback(() => {
    clearTimers();
    incrementSession();
    resetSession();
    startCountdown();
  }, [clearTimers, incrementSession, resetSession, startCountdown]);

  // Handle phase changes
  useEffect(() => {
    if (phase === TRAINING_PHASES.MID_REST) {
      startMidRest();
    }
  }, [phase, startMidRest]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    // State
    state: phase,
    currentAction,
    hitsCompleted,
    timeRemaining,
    countdownValue,
    totalHits: difficulty.totalHits,
    currentSession,
    numberOfSessions,
    isPaused,

    // Controls
    startTraining,
    stopTraining,
    pauseTraining,
    resumeTraining,
    proceedFromSessionEnd,
    skipBreak
  };
}

export default useTrainingSession;
