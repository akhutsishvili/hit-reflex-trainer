function ProgressBar({
  current,
  total,
  session,
  totalSessions,
  trainingType = 'single',
  combosCompleted = 0,
  totalCombos = 0
}) {
  // In combo mode, progress is based on combos; in single mode, on hits
  const progressValue = trainingType === 'combo' ? combosCompleted : current;
  const progressTotal = trainingType === 'combo' ? totalCombos : total;
  const progress = progressTotal > 0 ? (progressValue / progressTotal) * 100 : 0;

  return (
    <div className="w-full px-4 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      {/* Session indicator */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Session {session} of {totalSessions}
        </span>
        {trainingType === 'combo' ? (
          <div className="text-right">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              Combo {combosCompleted} / {totalCombos}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              ({current} hits)
            </span>
          </div>
        ) : (
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {current} / {total} hits
          </span>
        )}
      </div>

      {/* Progress bar container */}
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {/* Progress fill with gradient */}
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            trainingType === 'combo'
              ? 'bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500'
              : 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500'
          }`}
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer effect */}
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Session dots */}
      <div className="flex justify-center gap-2 mt-2">
        {Array.from({ length: totalSessions }, (_, i) => (
          <div
            key={i}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${i + 1 < session
                ? trainingType === 'combo' ? 'bg-orange-500' : 'bg-green-500'
                : i + 1 === session
                  ? trainingType === 'combo' ? 'bg-amber-400 scale-125' : 'bg-emerald-400 scale-125'
                  : 'bg-gray-300 dark:bg-gray-600'
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}

export default ProgressBar;
