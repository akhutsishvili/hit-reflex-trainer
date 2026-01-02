import { useMemo } from 'react';
import { useTraining } from '../context/TrainingContext';
import { formatTime, calculateHitsPerMinute } from '../utils/statsCalculator';

function ResultsScreen({ trainingStartTime, trainingEndTime }) {
  const {
    hitsCompleted,
    currentSession,
    numberOfSessions,
    difficulty,
    mode,
    sessionHistory,
    setPhase,
    resetAll,
    TRAINING_PHASES
  } = useTraining();

  // Calculate statistics
  const stats = useMemo(() => {
    const durationMs = trainingEndTime - trainingStartTime;
    // Sum up totalHits from session history (each session has its own random totalHits value)
    const totalExpectedHits = sessionHistory.reduce((sum, session) => sum + (session.totalHits || 0), 0);
    const hitsPerMinute = calculateHitsPerMinute(hitsCompleted, durationMs);
    const averagePaceMs = hitsCompleted > 1 ? durationMs / (hitsCompleted - 1) : 0;

    return {
      totalTime: formatTime(durationMs),
      sessionsCompleted: currentSession,
      totalSessions: numberOfSessions,
      hitsCompleted,
      totalExpectedHits,
      hitsPerMinute,
      averagePace: averagePaceMs > 0 ? (averagePaceMs / 1000).toFixed(2) : 'N/A',
      completionRate: totalExpectedHits > 0 ? Math.round((hitsCompleted / totalExpectedHits) * 100) : 100
    };
  }, [trainingStartTime, trainingEndTime, hitsCompleted, currentSession, numberOfSessions, sessionHistory]);

  // Get mode display label
  const getModeLabel = (modeValue) => {
    switch (modeValue) {
      case 'punches': return 'Punches Only';
      case 'kicks': return 'Kicks Only';
      case 'both': return 'Punches & Kicks';
      default: return modeValue;
    }
  };

  const handleTrainAgain = () => {
    resetAll();
    setPhase(TRAINING_PHASES.COUNTDOWN);
  };

  const handleChangeSettings = () => {
    resetAll();
    setPhase(TRAINING_PHASES.IDLE);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 flex flex-col">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-green-600 dark:text-green-400">
          Training Complete!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          Great workout! Here&apos;s your summary.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="flex-1 max-w-lg mx-auto w-full space-y-4">
        {/* Main stats cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Time</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {stats.totalTime}
            </p>
          </div>

          {/* Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sessions</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {stats.sessionsCompleted}/{stats.totalSessions}
            </p>
          </div>

          {/* Total Hits */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Hits</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {stats.hitsCompleted}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              of {stats.totalExpectedHits}
            </p>
          </div>

          {/* Average Pace */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Pace</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {stats.averagePace}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              seconds
            </p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.completionRate}%</p>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.completionRate >= 100
                  ? 'bg-green-500'
                  : stats.completionRate >= 75
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Training Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Training Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Difficulty</span>
              <span className="font-semibold text-gray-900 dark:text-white">{difficulty.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Mode</span>
              <span className="font-semibold text-gray-900 dark:text-white">{getModeLabel(mode)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Hits/Minute</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.hitsPerMinute}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 max-w-lg mx-auto w-full space-y-3">
        <button
          onClick={handleTrainAgain}
          className="
            w-full py-5 px-8 rounded-2xl
            bg-gradient-to-r from-green-500 to-emerald-600
            text-white text-xl font-bold
            shadow-lg shadow-green-500/30
            hover:shadow-xl hover:shadow-green-500/40
            active:scale-[0.98]
            transition-all duration-200
            min-h-[64px]
          "
        >
          Train Again
        </button>
        <button
          onClick={handleChangeSettings}
          className="
            w-full py-4 px-8 rounded-xl
            bg-white dark:bg-gray-800
            text-gray-700 dark:text-gray-300
            font-semibold text-lg
            border border-gray-200 dark:border-gray-700
            hover:bg-gray-50 dark:hover:bg-gray-700
            active:scale-[0.98]
            transition-all duration-200
            min-h-[56px]
          "
        >
          Change Settings
        </button>
      </div>
    </div>
  );
}

export default ResultsScreen;
