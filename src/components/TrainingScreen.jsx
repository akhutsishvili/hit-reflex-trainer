import { useState, useCallback, useRef } from 'react';
import ActionDisplay from './ActionDisplay';
import ProgressBar from './ProgressBar';
import { useTraining } from '../context/TrainingContext';
import { getComboSettings } from '../utils/difficultyConfig';

function TrainingScreen({ currentAction, sessionTotalHits }) {
  const {
    hitsCompleted,
    combosCompleted,
    trainingType,
    currentSession,
    numberOfSessions,
    difficulty,
    setPhase,
    TRAINING_PHASES
  } = useTraining();

  const comboSettings = getComboSettings(difficulty.id);

  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef(null);
  const holdStartRef = useRef(null);

  const handleStopPress = useCallback(() => {
    holdStartRef.current = Date.now();

    const updateProgress = () => {
      if (!holdStartRef.current) return;

      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min((elapsed / 1000) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        setShowStopConfirm(true);
        holdStartRef.current = null;
        setHoldProgress(0);
      } else {
        holdTimerRef.current = requestAnimationFrame(updateProgress);
      }
    };

    holdTimerRef.current = requestAnimationFrame(updateProgress);
  }, []);

  const handleStopRelease = useCallback(() => {
    if (holdTimerRef.current) {
      cancelAnimationFrame(holdTimerRef.current);
    }
    holdStartRef.current = null;
    setHoldProgress(0);
  }, []);

  const handleConfirmStop = useCallback(() => {
    setPhase(TRAINING_PHASES.COMPLETE);
  }, [setPhase, TRAINING_PHASES]);

  const handleCancelStop = useCallback(() => {
    setShowStopConfirm(false);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Progress bar at top */}
      <ProgressBar
        current={hitsCompleted}
        total={sessionTotalHits}
        session={currentSession}
        totalSessions={numberOfSessions}
        trainingType={trainingType}
        combosCompleted={combosCompleted}
        totalCombos={comboSettings?.totalCombos || 0}
      />

      {/* Main action display */}
      <ActionDisplay action={currentAction} />

      {/* Bottom controls */}
      <div className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        {/* Stop button with hold-to-confirm */}
        <button
          onMouseDown={handleStopPress}
          onMouseUp={handleStopRelease}
          onMouseLeave={handleStopRelease}
          onTouchStart={handleStopPress}
          onTouchEnd={handleStopRelease}
          className={`
            relative w-full py-4 px-8 rounded-xl
            font-semibold text-lg
            overflow-hidden
            min-h-[56px]
            transition-all duration-100
            ${holdProgress > 0
              ? 'bg-red-100 dark:bg-red-900/50 border-2 border-red-500'
              : 'bg-gray-200 dark:bg-gray-700 border-2 border-transparent'
            }
          `}
        >
          {/* Hold progress indicator */}
          <div
            className="absolute inset-0 bg-red-500 transition-all duration-75"
            style={{
              width: `${holdProgress}%`,
              opacity: 0.4 + (holdProgress / 100) * 0.3
            }}
          />
          <span className={`relative z-10 ${holdProgress > 0 ? 'text-red-700 dark:text-red-200' : 'text-gray-700 dark:text-gray-300'}`}>
            {holdProgress > 0
              ? `Stopping... ${Math.round(holdProgress)}%`
              : 'Hold to Stop Training'
            }
          </span>
        </button>
      </div>

      {/* Stop confirmation modal */}
      {showStopConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Stop Training?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your progress will be saved and you&apos;ll see your results.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelStop}
                className="
                  flex-1 py-4 px-4 rounded-xl
                  bg-gray-200 dark:bg-gray-700
                  text-gray-700 dark:text-gray-300
                  font-semibold
                  min-h-[56px]
                  active:bg-gray-300 dark:active:bg-gray-600
                  transition-colors
                "
              >
                Continue
              </button>
              <button
                onClick={handleConfirmStop}
                className="
                  flex-1 py-4 px-4 rounded-xl
                  bg-red-600 text-white
                  font-semibold
                  min-h-[56px]
                  active:bg-red-700
                  transition-colors
                "
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainingScreen;
