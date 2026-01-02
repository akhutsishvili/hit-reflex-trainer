function BreakScreen({ timeRemaining, nextSession, totalSessions }) {
  const isWarning = timeRemaining <= 5;
  const progress = ((30 - timeRemaining) / 30) * 100;

  return (
    <div
      className={`
        fixed inset-0 flex flex-col items-center justify-center
        transition-colors duration-500
        ${isWarning
          ? 'bg-gradient-to-br from-amber-500 to-orange-600'
          : 'bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black'
        }
      `}
    >
      {/* Pulsing warning background for last 5 seconds */}
      {isWarning && (
        <div className="absolute inset-0 bg-amber-400 animate-pulse opacity-20" />
      )}

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* Status text */}
        <h1
          className={`
            text-5xl sm:text-6xl font-black mb-4 tracking-tight
            ${isWarning ? 'text-white animate-pulse' : 'text-white'}
          `}
        >
          {isWarning ? 'GET READY!' : 'REST'}
        </h1>

        {/* Countdown timer */}
        <div className="relative inline-block">
          <span
            className={`
              text-8xl sm:text-9xl font-black
              ${isWarning ? 'text-white' : 'text-gray-300 dark:text-gray-400'}
              transition-all duration-300
              ${isWarning ? 'scale-110' : 'scale-100'}
            `}
          >
            {timeRemaining}
          </span>
          <span className="block text-xl text-white/60 mt-2">seconds</span>
        </div>

        {/* Session info */}
        <div className="mt-8 text-white/80">
          <p className="text-lg sm:text-xl font-medium">
            Up next: Session {nextSession} of {totalSessions}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`
                h-full rounded-full transition-all duration-1000 ease-linear
                ${isWarning
                  ? 'bg-white'
                  : 'bg-gradient-to-r from-green-400 to-emerald-500'
                }
              `}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tips */}
        {!isWarning && (
          <div className="mt-12 max-w-xs mx-auto">
            <p className="text-white/50 text-sm">
              Catch your breath. Stay focused.
            </p>
          </div>
        )}
      </div>

      {/* Warning flash indicators */}
      {isWarning && (
        <>
          <div className="absolute top-0 left-0 right-0 h-2 bg-white animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-white animate-pulse" />
        </>
      )}

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-white/30" />
      <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-white/30" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-white/30" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-white/30" />
    </div>
  );
}

export default BreakScreen;
