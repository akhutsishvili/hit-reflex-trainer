/**
 * Combat Reflex - Training Context
 *
 * Provides global state management for the training application.
 * Uses React Context with useReducer for predictable state updates.
 */

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DIFFICULTIES, TRAINING_MODES, TRAINING_TYPES, DEFAULT_DIFFICULTY } from '../utils/difficultyConfig';
import { useProfiles } from './ProfileContext';

/**
 * Training phases that represent the state machine states
 * @readonly
 * @enum {string}
 */
export const TRAINING_PHASES = {
  IDLE: 'IDLE',               // Not training, ready to start
  COUNTDOWN: 'COUNTDOWN',     // Initial countdown before training starts
  TRAINING: 'TRAINING',       // Active training phase
  MID_REST: 'MID_REST',       // Mid-session rest break
  SESSION_END: 'SESSION_END', // End of a single session
  BREAK: 'BREAK',             // Break between sessions
  COMPLETE: 'COMPLETE'        // All sessions completed
};

/**
 * @typedef {Object} SessionHistoryEntry
 * @property {string} id - Unique session ID
 * @property {Date} timestamp - When the session was completed
 * @property {string} mode - Training mode used
 * @property {string} difficultyId - Difficulty ID used
 * @property {number} hitsCompleted - Number of hits completed
 * @property {number} totalHits - Total hits for the session
 * @property {number} durationMs - Session duration in milliseconds
 * @property {number} sessionNumber - Which session in the set (1-4)
 * @property {number} totalSessions - Total number of sessions in the set
 */

/**
 * @typedef {Object} TrainingState
 * @property {string} mode - Current training mode ('punches', 'kicks', 'both')
 * @property {string} trainingType - Current training type ('single', 'combo')
 * @property {Object} difficulty - Current difficulty configuration
 * @property {number} numberOfSessions - Total sessions to complete (1-4)
 * @property {string} phase - Current training phase
 * @property {number} currentSession - Current session number (1-based)
 * @property {number} hitsCompleted - Hits completed in current session
 * @property {number} combosCompleted - Combos completed in current session (combo mode only)
 */

// Action types for the reducer
const ACTIONS = {
  SET_MODE: 'SET_MODE',
  SET_TRAINING_TYPE: 'SET_TRAINING_TYPE',
  SET_DIFFICULTY: 'SET_DIFFICULTY',
  SET_NUMBER_OF_SESSIONS: 'SET_NUMBER_OF_SESSIONS',
  SET_PHASE: 'SET_PHASE',
  INCREMENT_SESSION: 'INCREMENT_SESSION',
  SET_HITS_COMPLETED: 'SET_HITS_COMPLETED',
  INCREMENT_HITS: 'INCREMENT_HITS',
  INCREMENT_COMBOS: 'INCREMENT_COMBOS',
  RESET_SESSION: 'RESET_SESSION',
  RESET_ALL: 'RESET_ALL'
};

/**
 * Initial state for the training context
 */
const initialState = {
  mode: TRAINING_MODES[2], // 'both' by default
  trainingType: TRAINING_TYPES[0], // 'single' by default
  difficulty: DEFAULT_DIFFICULTY,
  numberOfSessions: 2,
  phase: TRAINING_PHASES.IDLE,
  currentSession: 1,
  hitsCompleted: 0,
  combosCompleted: 0
};

/**
 * Reducer function for training state management
 * @param {TrainingState} state - Current state
 * @param {Object} action - Action to perform
 * @returns {TrainingState} New state
 */
function trainingReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_MODE:
      if (!TRAINING_MODES.includes(action.payload)) {
        console.warn(`Invalid training mode: ${action.payload}`);
        return state;
      }
      return { ...state, mode: action.payload };

    case ACTIONS.SET_TRAINING_TYPE:
      if (!TRAINING_TYPES.includes(action.payload)) {
        console.warn(`Invalid training type: ${action.payload}`);
        return state;
      }
      return { ...state, trainingType: action.payload };

    case ACTIONS.SET_DIFFICULTY:
      // payload can be either a difficultyId string or full settings object
      if (typeof action.payload === 'object' && action.payload.id) {
        return { ...state, difficulty: action.payload };
      }
      // Fallback to DIFFICULTIES lookup for backwards compatibility
      const difficulty = DIFFICULTIES.find(d => d.id === action.payload);
      if (!difficulty) {
        console.warn(`Invalid difficulty ID: ${action.payload}`);
        return state;
      }
      return { ...state, difficulty };

    case ACTIONS.SET_NUMBER_OF_SESSIONS:
      const sessions = Math.min(4, Math.max(1, action.payload));
      return { ...state, numberOfSessions: sessions };

    case ACTIONS.SET_PHASE:
      if (!Object.values(TRAINING_PHASES).includes(action.payload)) {
        console.warn(`Invalid training phase: ${action.payload}`);
        return state;
      }
      return { ...state, phase: action.payload };

    case ACTIONS.INCREMENT_SESSION:
      return { ...state, currentSession: state.currentSession + 1 };

    case ACTIONS.SET_HITS_COMPLETED:
      return { ...state, hitsCompleted: action.payload };

    case ACTIONS.INCREMENT_HITS:
      return { ...state, hitsCompleted: state.hitsCompleted + 1 };

    case ACTIONS.INCREMENT_COMBOS:
      return { ...state, combosCompleted: state.combosCompleted + 1 };

    case ACTIONS.RESET_SESSION:
      return { ...state, hitsCompleted: 0, combosCompleted: 0 };

    case ACTIONS.RESET_ALL:
      return {
        ...state,
        phase: TRAINING_PHASES.IDLE,
        currentSession: 1,
        hitsCompleted: 0,
        combosCompleted: 0
      };

    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
}

// Create the context
const TrainingContext = createContext(null);

/**
 * Maximum number of session history entries to store
 */
const MAX_HISTORY_ENTRIES = 10;

/**
 * TrainingProvider component
 * Wraps the application and provides training state to all children
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function TrainingProvider({ children }) {
  const [state, dispatch] = useReducer(trainingReducer, initialState);
  const { getEffectiveSettings, getEffectiveComboSettings, activeProfileId } = useProfiles();

  // Persist session history in localStorage
  const [sessionHistory, setSessionHistory] = useLocalStorage(
    'combat-reflex-session-history',
    []
  );

  // Persist user preferences in localStorage
  const [preferences, setPreferences] = useLocalStorage(
    'combat-reflex-preferences',
    {
      mode: initialState.mode,
      trainingType: initialState.trainingType,
      difficultyId: initialState.difficulty.id,
      numberOfSessions: initialState.numberOfSessions
    }
  );

  // Load preferences on mount
  useEffect(() => {
    if (preferences.mode) {
      dispatch({ type: ACTIONS.SET_MODE, payload: preferences.mode });
    }
    if (preferences.trainingType) {
      dispatch({ type: ACTIONS.SET_TRAINING_TYPE, payload: preferences.trainingType });
    }
    if (preferences.difficultyId) {
      dispatch({ type: ACTIONS.SET_DIFFICULTY, payload: preferences.difficultyId });
    }
    if (preferences.numberOfSessions) {
      dispatch({ type: ACTIONS.SET_NUMBER_OF_SESSIONS, payload: preferences.numberOfSessions });
    }
  }, []); // Only run on mount

  // Action creators
  const actions = useMemo(() => ({
    /**
     * Set the training mode
     * @param {string} mode - 'punches', 'kicks', or 'both'
     */
    setMode: (mode) => {
      dispatch({ type: ACTIONS.SET_MODE, payload: mode });
      setPreferences(prev => ({ ...prev, mode }));
    },

    /**
     * Set the training type
     * @param {string} trainingType - 'single' or 'combo'
     */
    setTrainingType: (trainingType) => {
      dispatch({ type: ACTIONS.SET_TRAINING_TYPE, payload: trainingType });
      setPreferences(prev => ({ ...prev, trainingType }));
    },

    /**
     * Set the difficulty level
     * Uses effective settings from active profile
     * @param {string} difficultyId - Difficulty ID
     */
    setDifficulty: (difficultyId) => {
      const effectiveSettings = getEffectiveSettings(difficultyId);
      if (effectiveSettings) {
        dispatch({ type: ACTIONS.SET_DIFFICULTY, payload: effectiveSettings });
      } else {
        // Fallback to ID-based lookup
        dispatch({ type: ACTIONS.SET_DIFFICULTY, payload: difficultyId });
      }
      setPreferences(prev => ({ ...prev, difficultyId }));
    },

    /**
     * Set the number of sessions (1-4)
     * @param {number} count - Number of sessions
     */
    setNumberOfSessions: (count) => {
      dispatch({ type: ACTIONS.SET_NUMBER_OF_SESSIONS, payload: count });
      setPreferences(prev => ({ ...prev, numberOfSessions: count }));
    },

    /**
     * Set the current training phase
     * @param {string} phase - Training phase from TRAINING_PHASES
     */
    setPhase: (phase) => {
      dispatch({ type: ACTIONS.SET_PHASE, payload: phase });
    },

    /**
     * Move to the next session
     */
    incrementSession: () => {
      dispatch({ type: ACTIONS.INCREMENT_SESSION });
    },

    /**
     * Set the number of hits completed
     * @param {number} hits - Number of hits
     */
    setHitsCompleted: (hits) => {
      dispatch({ type: ACTIONS.SET_HITS_COMPLETED, payload: hits });
    },

    /**
     * Increment the hit counter by 1
     */
    incrementHits: () => {
      dispatch({ type: ACTIONS.INCREMENT_HITS });
    },

    /**
     * Increment the combo counter by 1
     */
    incrementCombos: () => {
      dispatch({ type: ACTIONS.INCREMENT_COMBOS });
    },

    /**
     * Reset the current session (keep settings)
     */
    resetSession: () => {
      dispatch({ type: ACTIONS.RESET_SESSION });
    },

    /**
     * Reset all training state (keep settings)
     */
    resetAll: () => {
      dispatch({ type: ACTIONS.RESET_ALL });
    },

    /**
     * Add a session to history
     * @param {SessionHistoryEntry} entry - Session data to record
     */
    addToHistory: (entry) => {
      setSessionHistory(prev => {
        const newHistory = [
          {
            ...entry,
            id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
          },
          ...prev
        ].slice(0, MAX_HISTORY_ENTRIES);
        return newHistory;
      });
    },

    /**
     * Clear all session history
     */
    clearHistory: () => {
      setSessionHistory([]);
    }
  }), [setPreferences, setSessionHistory, getEffectiveSettings]);

  // Refresh difficulty settings when active profile changes
  useEffect(() => {
    if (state.difficulty?.id) {
      const effectiveSettings = getEffectiveSettings(state.difficulty.id);
      if (effectiveSettings) {
        dispatch({ type: ACTIONS.SET_DIFFICULTY, payload: effectiveSettings });
      }
    }
  }, [activeProfileId, getEffectiveSettings]); // Re-run when profile changes

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    ...state,
    sessionHistory,

    // Constants for easy access
    TRAINING_PHASES,
    TRAINING_MODES,
    TRAINING_TYPES,
    DIFFICULTIES,

    // Profile functions for accessing effective settings
    getEffectiveSettings,
    getEffectiveComboSettings,

    // Actions
    ...actions
  }), [state, sessionHistory, actions, getEffectiveSettings, getEffectiveComboSettings]);

  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
}

/**
 * Custom hook to access the training context
 * Must be used within a TrainingProvider
 *
 * @returns {Object} Training context value
 * @throws {Error} If used outside of TrainingProvider
 *
 * @example
 * const { mode, difficulty, setMode, setDifficulty } = useTraining();
 */
export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
}

export default TrainingContext;
