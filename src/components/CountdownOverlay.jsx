import { useEffect, useState } from 'react';

function CountdownOverlay({ count, onComplete }) {
  const [displayCount, setDisplayCount] = useState(count);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setDisplayCount(count);
    setAnimating(true);

    const animationTimer = setTimeout(() => {
      setAnimating(false);
    }, 200);

    return () => clearTimeout(animationTimer);
  }, [count]);

  useEffect(() => {
    if (count === 0 && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [count, onComplete]);

  const isGo = displayCount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
      {/* Background pulse */}
      <div
        className={`
          absolute inset-0 transition-opacity duration-300
          ${isGo
            ? 'bg-gradient-to-br from-green-600 to-emerald-700 opacity-100'
            : 'bg-gradient-to-br from-purple-900 to-indigo-900 opacity-80'
          }
        `}
      />

      {/* Countdown number */}
      <div className="relative">
        <span
          className={`
            block font-black text-white select-none
            transition-all duration-200
            ${animating ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}
            ${isGo ? 'text-8xl sm:text-9xl' : 'text-9xl sm:text-[12rem]'}
            drop-shadow-2xl
          `}
        >
          {isGo ? 'GO!' : displayCount}
        </span>

        {/* Pulse ring */}
        <div
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-48 h-48 rounded-full border-4
            ${isGo ? 'border-green-400' : 'border-purple-400'}
            animate-ping opacity-30
          `}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-20 left-0 right-0 text-center">
        <p className="text-white/70 text-lg sm:text-xl font-medium">
          {isGo ? 'Training Started!' : 'Get Ready...'}
        </p>
      </div>

      {/* Corner indicators */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <div className="w-8 h-8 border-l-2 border-t-2 border-white/30" />
        <div className="w-8 h-8 border-r-2 border-t-2 border-white/30" />
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <div className="w-8 h-8 border-l-2 border-b-2 border-white/30" />
        <div className="w-8 h-8 border-r-2 border-b-2 border-white/30" />
      </div>
    </div>
  );
}

export default CountdownOverlay;
