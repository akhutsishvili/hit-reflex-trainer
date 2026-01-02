import { useState, useEffect, useCallback, useRef } from 'react';
import { TrainingProvider, useTraining, TRAINING_PHASES } from './context/TrainingContext';
import {
  getRandomInterval,
  getRandomComboSize,
  getRandomStrikeInterval,
  getRandomComboRest,
  getComboSettings
} from './utils/difficultyConfig';
import { getRandomTotalHits } from './utils/profileUtils';
import { useAudio } from './hooks/useAudio';
import { useWakeLock } from './hooks/useWakeLock';
import ConfigScreen from './components/ConfigScreen';
import CountdownOverlay from './components/CountdownOverlay';
import TrainingScreen from './components/TrainingScreen';
import BreakScreen from './components/BreakScreen';
import ResultsScreen from './components/ResultsScreen';

function TrainingApp() {
  const {
    phase,
    mode,
    trainingType,
    difficulty,
    numberOfSessions,
    currentSession,
    hitsCompleted,
    combosCompleted,
    setPhase,
    incrementHits,
    incrementCombos,
    incrementSession,
    resetSession,
    addToHistory,
    getEffectiveComboSettings,
    TRAINING_PHASES
  } = useTraining();

  // Audio and Wake Lock hooks
  const { playPunch, playKick, playSessionStart, playSessionEnd, playWarning, playCountdown, initAudio } = useAudio();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  // Local state for countdown and current action
  const [countdownValue, setCountdownValue] = useState(3);
  const [currentAction, setCurrentAction] = useState(null);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(30);
  const [trainingStartTime, setTrainingStartTime] = useState(null);
  const [trainingEndTime, setTrainingEndTime] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionTotalHits, setSessionTotalHits] = useState(null); // Random hit count for this session

  // Refs for timers
  const countdownTimerRef = useRef(null);
  const actionTimerRef = useRef(null);
  const breakTimerRef = useRef(null);
  const warningPlayedRef = useRef(false);
  const comboTimersRef = useRef([]);

  // Get random action based on mode
  const getRandomAction = useCallback(() => {
    if (mode === 'punches') return 'punch';
    if (mode === 'kicks') return 'kick';
    return Math.random() < 0.5 ? 'punch' : 'kick';
  }, [mode]);

  // Schedule next action
  const scheduleNextAction = useCallback(() => {
    const interval = getRandomInterval(difficulty);

    actionTimerRef.current = setTimeout(() => {
      // Get and show the action
      const action = getRandomAction();
      setCurrentAction(action);

      // Play the appropriate sound
      if (action === 'punch') {
        playPunch();
      } else {
        playKick();
      }

      // After a short display time, clear action and increment hits
      setTimeout(() => {
        setCurrentAction(null);
        incrementHits();
      }, 800); // Action displayed for 800ms

    }, interval);
  }, [difficulty, getRandomAction, incrementHits, playPunch, playKick]);

  // Schedule a combo (series of strikes)
  const scheduleCombo = useCallback(() => {
    const comboConfig = getEffectiveComboSettings(difficulty.id);
    if (!comboConfig) return;

    const comboSize = getRandomComboSize(comboConfig);
    const restAfterCombo = getRandomComboRest(comboConfig);

    // Clear any previous combo timers
    comboTimersRef.current.forEach(timer => clearTimeout(timer));
    comboTimersRef.current = [];

    // Schedule each strike in the combo
    let cumulativeDelay = 0;
    for (let i = 0; i < comboSize; i++) {
      const strikeTimer = setTimeout(() => {
        const action = getRandomAction();
        setCurrentAction(action);

        if (action === 'punch') {
          playPunch();
        } else {
          playKick();
        }

        // Clear action after display time and increment hits
        setTimeout(() => {
          setCurrentAction(null);
          incrementHits();
        }, 300);
      }, cumulativeDelay);

      comboTimersRef.current.push(strikeTimer);

      // Add interval for next strike (except after last one)
      if (i < comboSize - 1) {
        cumulativeDelay += getRandomStrikeInterval(comboConfig);
      }
    }

    // After combo complete + rest, increment combo count
    // The combo ends after the last strike display time (300ms)
    const comboEndDelay = cumulativeDelay + 300;

    const comboCompleteTimer = setTimeout(() => {
      incrementCombos();
    }, comboEndDelay);

    comboTimersRef.current.push(comboCompleteTimer);

  }, [difficulty.id, getEffectiveComboSettings, getRandomAction, incrementHits, incrementCombos, playPunch, playKick]);

  // Handle countdown phase
  useEffect(() => {
    if (phase === TRAINING_PHASES.COUNTDOWN) {
      setCountdownValue(3);

      // Initialize audio and request wake lock on training start
      initAudio();
      requestWakeLock();

      const runCountdown = (value) => {
        // Play countdown sound for each tick (3, 2, 1)
        if (value > 0) {
          playCountdown();
        }

        if (value > 0) {
          countdownTimerRef.current = setTimeout(() => {
            setCountdownValue(value - 1);
            runCountdown(value - 1);
          }, 1000);
        } else {
          // Countdown complete, start training
          countdownTimerRef.current = setTimeout(() => {
            if (!trainingStartTime) {
              setTrainingStartTime(Date.now());
            }
            setSessionStartTime(Date.now());
            // Set random total hits for this session from profile range
            const totalHits = difficulty.totalHits?.min !== undefined
              ? getRandomTotalHits(difficulty.totalHits)
              : difficulty.totalHits;
            setSessionTotalHits(totalHits);
            playSessionStart();
            setPhase(TRAINING_PHASES.TRAINING);
          }, 800);
        }
      };

      // Small delay to ensure audio is initialized before first sound
      setTimeout(() => runCountdown(3), 100);

      return () => {
        if (countdownTimerRef.current) {
          clearTimeout(countdownTimerRef.current);
        }
      };
    }
  }, [phase, TRAINING_PHASES, setPhase, trainingStartTime, difficulty.totalHits, initAudio, requestWakeLock, playSessionStart, playCountdown]);

  // Handle training phase - schedule actions (single mode)
  useEffect(() => {
    if (phase === TRAINING_PHASES.TRAINING && trainingType === 'single') {
      scheduleNextAction();

      return () => {
        if (actionTimerRef.current) {
          clearTimeout(actionTimerRef.current);
        }
      };
    }
  }, [phase, TRAINING_PHASES, trainingType, hitsCompleted, scheduleNextAction]);

  // Handle training phase - schedule combos (combo mode)
  useEffect(() => {
    if (phase === TRAINING_PHASES.TRAINING && trainingType === 'combo') {
      const comboConfig = getEffectiveComboSettings(difficulty.id);
      if (!comboConfig) return;

      // Check if session complete
      if (combosCompleted >= comboConfig.totalCombos) {
        return; // Will be handled by completion effect
      }

      // Schedule next combo after rest period
      const restDuration = combosCompleted === 0 ? 0 : getRandomComboRest(comboConfig);

      actionTimerRef.current = setTimeout(() => {
        scheduleCombo();
      }, restDuration);

      return () => {
        if (actionTimerRef.current) {
          clearTimeout(actionTimerRef.current);
        }
        comboTimersRef.current.forEach(timer => clearTimeout(timer));
        comboTimersRef.current = [];
      };
    }
  }, [phase, TRAINING_PHASES, trainingType, difficulty.id, combosCompleted, scheduleCombo]);

  // Check for session completion (single mode)
  useEffect(() => {
    if (phase === TRAINING_PHASES.TRAINING && trainingType === 'single' && sessionTotalHits && hitsCompleted >= sessionTotalHits) {
      // Clear any pending action
      if (actionTimerRef.current) {
        clearTimeout(actionTimerRef.current);
      }
      setCurrentAction(null);
      playSessionEnd();

      // Save session to history
      addToHistory({
        mode,
        trainingType,
        difficultyId: difficulty.id,
        hitsCompleted,
        totalHits: sessionTotalHits,
        durationMs: Date.now() - sessionStartTime,
        sessionNumber: currentSession,
        totalSessions: numberOfSessions
      });

      // Check if more sessions remain
      if (currentSession < numberOfSessions) {
        setPhase(TRAINING_PHASES.BREAK);
      } else {
        setTrainingEndTime(Date.now());
        releaseWakeLock();
        setPhase(TRAINING_PHASES.COMPLETE);
      }
    }
  }, [
    phase,
    trainingType,
    hitsCompleted,
    sessionTotalHits,
    difficulty.id,
    currentSession,
    numberOfSessions,
    sessionStartTime,
    mode,
    addToHistory,
    setPhase,
    TRAINING_PHASES,
    playSessionEnd,
    releaseWakeLock
  ]);

  // Check for session completion (combo mode)
  useEffect(() => {
    const comboConfig = getComboSettings(difficulty.id);
    if (phase === TRAINING_PHASES.TRAINING && trainingType === 'combo' && comboConfig && combosCompleted >= comboConfig.totalCombos) {
      // Clear any pending timers
      if (actionTimerRef.current) {
        clearTimeout(actionTimerRef.current);
      }
      comboTimersRef.current.forEach(timer => clearTimeout(timer));
      comboTimersRef.current = [];
      setCurrentAction(null);
      playSessionEnd();

      // Save session to history
      addToHistory({
        mode,
        trainingType,
        difficultyId: difficulty.id,
        hitsCompleted,
        totalHits: hitsCompleted, // In combo mode, use actual hits
        combosCompleted,
        totalCombos: comboConfig.totalCombos,
        durationMs: Date.now() - sessionStartTime,
        sessionNumber: currentSession,
        totalSessions: numberOfSessions
      });

      // Check if more sessions remain
      if (currentSession < numberOfSessions) {
        setPhase(TRAINING_PHASES.BREAK);
      } else {
        setTrainingEndTime(Date.now());
        releaseWakeLock();
        setPhase(TRAINING_PHASES.COMPLETE);
      }
    }
  }, [
    phase,
    trainingType,
    combosCompleted,
    hitsCompleted,
    difficulty.id,
    currentSession,
    numberOfSessions,
    sessionStartTime,
    mode,
    addToHistory,
    setPhase,
    TRAINING_PHASES,
    playSessionEnd,
    releaseWakeLock
  ]);

  // Handle break phase
  useEffect(() => {
    if (phase === TRAINING_PHASES.BREAK) {
      // Get break duration from profile rest settings (default to 30 seconds)
      const breakDuration = difficulty.rest?.enabled !== false
        ? Math.round((difficulty.rest?.breakDuration || 30000) / 1000)
        : 0;

      // If rest is disabled, skip straight to next session
      if (breakDuration === 0) {
        incrementSession();
        resetSession();
        setPhase(TRAINING_PHASES.COUNTDOWN);
        return;
      }

      setBreakTimeRemaining(breakDuration);
      warningPlayedRef.current = false;

      const runBreak = (remaining) => {
        if (remaining > 0) {
          // Play warning sound at 5 seconds
          if (remaining === 5 && !warningPlayedRef.current) {
            playWarning();
            warningPlayedRef.current = true;
          }

          breakTimerRef.current = setTimeout(() => {
            setBreakTimeRemaining(remaining - 1);
            runBreak(remaining - 1);
          }, 1000);
        } else {
          // Break complete, start next session
          incrementSession();
          resetSession();
          setPhase(TRAINING_PHASES.COUNTDOWN);
        }
      };

      runBreak(breakDuration);

      return () => {
        if (breakTimerRef.current) {
          clearTimeout(breakTimerRef.current);
        }
      };
    }
  }, [phase, TRAINING_PHASES, incrementSession, resetSession, setPhase, playWarning, difficulty.rest]);

  // Handle complete phase - set end time if not already set
  useEffect(() => {
    if (phase === TRAINING_PHASES.COMPLETE && !trainingEndTime) {
      setTrainingEndTime(Date.now());
    }
  }, [phase, TRAINING_PHASES, trainingEndTime]);

  // Reset training times when going back to IDLE
  useEffect(() => {
    if (phase === TRAINING_PHASES.IDLE) {
      setTrainingStartTime(null);
      setTrainingEndTime(null);
      setSessionStartTime(null);
      setSessionTotalHits(null);
      setCurrentAction(null);
    }
  }, [phase, TRAINING_PHASES]);

  // Render appropriate screen based on phase
  const renderScreen = () => {
    switch (phase) {
      case TRAINING_PHASES.IDLE:
        return <ConfigScreen />;

      case TRAINING_PHASES.COUNTDOWN:
        return (
          <CountdownOverlay
            count={countdownValue}
            onComplete={() => {}}
          />
        );

      case TRAINING_PHASES.TRAINING:
      case TRAINING_PHASES.MID_REST:
        return <TrainingScreen currentAction={currentAction} sessionTotalHits={sessionTotalHits} />;

      case TRAINING_PHASES.BREAK:
        return (
          <BreakScreen
            timeRemaining={breakTimeRemaining}
            nextSession={currentSession + 1}
            totalSessions={numberOfSessions}
          />
        );

      case TRAINING_PHASES.COMPLETE:
        return (
          <ResultsScreen
            trainingStartTime={trainingStartTime}
            trainingEndTime={trainingEndTime || Date.now()}
          />
        );

      default:
        return <ConfigScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {renderScreen()}
    </div>
  );
}

function App() {
  return (
    <TrainingProvider>
      <TrainingApp />
    </TrainingProvider>
  );
}

export default App;
