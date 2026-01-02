function ActionDisplay({ action }) {
  if (!action) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-200 dark:bg-gray-800 transition-colors duration-300">
        <p className="text-2xl sm:text-3xl text-gray-500 dark:text-gray-500 font-medium">
          Get Ready...
        </p>
      </div>
    );
  }

  const isPunch = action === 'punch';

  return (
    <div
      className={`
        flex-1 flex items-center justify-center
        transition-colors duration-100
        ${isPunch
          ? 'bg-red-600 dark:bg-red-700'
          : 'bg-blue-600 dark:bg-blue-700'
        }
        animate-action-pulse
      `}
    >
      <div className="text-center">
        <h1
          className={`
            text-7xl sm:text-8xl md:text-9xl font-black tracking-wider
            text-white
            drop-shadow-2xl
            animate-action-scale
            select-none
          `}
        >
          {isPunch ? 'PUNCH!' : 'KICK!'}
        </h1>
        <div className="mt-4">
          <span className="text-white/80 text-xl sm:text-2xl font-medium uppercase tracking-widest">
            {isPunch ? 'Strike Now' : 'Kick Now'}
          </span>
        </div>
      </div>

      {/* Pulse rings animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-32 h-32 rounded-full
            ${isPunch ? 'bg-red-400' : 'bg-blue-400'}
            opacity-30 animate-ping
          `}
        />
      </div>
    </div>
  );
}

export default ActionDisplay;
