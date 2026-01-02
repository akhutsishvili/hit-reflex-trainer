import { useState } from 'react';
import { useTraining } from '../context/TrainingContext';
import { DIFFICULTIES, TRAINING_MODES, TRAINING_TYPES } from '../utils/difficultyConfig';
import ProfileSelector from './profiles/ProfileSelector';
import ProfileEditor from './profiles/ProfileEditor';

function ConfigScreen() {
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const {
    mode,
    trainingType,
    difficulty,
    numberOfSessions,
    setMode,
    setTrainingType,
    setDifficulty,
    setNumberOfSessions,
    setPhase,
    getEffectiveComboSettings,
    TRAINING_PHASES
  } = useTraining();

  const handleStartTraining = () => {
    setPhase(TRAINING_PHASES.COUNTDOWN);
  };

  // Get mode display labels
  const getModeLabel = (modeValue) => {
    switch (modeValue) {
      case 'punches': return 'Punches Only';
      case 'kicks': return 'Kicks Only';
      case 'both': return 'Both';
      default: return modeValue;
    }
  };

  // Get training type labels
  const getTrainingTypeLabel = (type) => {
    switch (type) {
      case 'single': return 'Single Hits';
      case 'combo': return 'Combo Series';
      default: return type;
    }
  };

  // Get combo settings for current difficulty from active profile
  const comboSettings = getEffectiveComboSettings(difficulty.id);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 flex flex-col">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Combat Reflex
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          Reaction Training System
        </p>
      </header>

      {/* Profile Selector */}
      <div className="max-w-lg mx-auto w-full mb-6 flex justify-center">
        <ProfileSelector onCustomize={() => setShowProfileEditor(true)} />
      </div>

      {/* Profile Editor Modal */}
      <ProfileEditor
        isOpen={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
      />

      {/* Settings Container */}
      <div className="flex-1 max-w-lg mx-auto w-full space-y-6">
        {/* Difficulty Selector */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Difficulty
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setDifficulty(diff.id)}
                className={`
                  py-4 px-3 rounded-xl font-medium text-base sm:text-lg
                  transition-all duration-200 min-h-[64px]
                  ${difficulty.id === diff.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                {diff.name}
              </button>
            ))}
          </div>
        </section>

        {/* Training Mode Selector */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Training Mode
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {TRAINING_MODES.map((modeValue) => (
              <button
                key={modeValue}
                onClick={() => setMode(modeValue)}
                className={`
                  py-4 px-3 rounded-xl font-medium text-sm sm:text-base
                  transition-all duration-200 min-h-[64px]
                  ${mode === modeValue
                    ? modeValue === 'punches'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 scale-105'
                      : modeValue === 'kicks'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                {getModeLabel(modeValue)}
              </button>
            ))}
          </div>
        </section>

        {/* Training Type Selector */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Training Type
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {TRAINING_TYPES.map((typeValue) => (
              <button
                key={typeValue}
                onClick={() => setTrainingType(typeValue)}
                className={`
                  py-4 px-3 rounded-xl font-medium text-sm sm:text-base
                  transition-all duration-200 min-h-[64px]
                  ${trainingType === typeValue
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                {getTrainingTypeLabel(typeValue)}
              </button>
            ))}
          </div>
        </section>

        {/* Sessions Selector */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Number of Sessions
          </h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setNumberOfSessions(num)}
                className={`
                  py-4 px-3 rounded-xl font-bold text-xl sm:text-2xl
                  transition-all duration-200 min-h-[64px]
                  ${numberOfSessions === num
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/30 scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                {num}
              </button>
            ))}
          </div>
        </section>

        {/* Training Summary */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Training Summary
          </h3>
          {trainingType === 'single' ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Hits per session:</span>
                <span className="ml-2 font-semibold">
                  {typeof difficulty.totalHits === 'object'
                    ? `${difficulty.totalHits.min}-${difficulty.totalHits.max}`
                    : difficulty.totalHits}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total hits:</span>
                <span className="ml-2 font-semibold">
                  {typeof difficulty.totalHits === 'object'
                    ? `${difficulty.totalHits.min * numberOfSessions}-${difficulty.totalHits.max * numberOfSessions}`
                    : difficulty.totalHits * numberOfSessions}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Combos per session:</span>
                <span className="ml-2 font-semibold">{comboSettings?.totalCombos || 0}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Strikes per combo:</span>
                <span className="ml-2 font-semibold">
                  {comboSettings?.comboSize.min === comboSettings?.comboSize.max
                    ? comboSettings?.comboSize.min
                    : `${comboSettings?.comboSize.min}-${comboSettings?.comboSize.max}`}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total combos:</span>
                <span className="ml-2 font-semibold">{(comboSettings?.totalCombos || 0) * numberOfSessions}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Rest between:</span>
                <span className="ml-2 font-semibold">
                  {((comboSettings?.restBetweenCombos.min || 0) / 1000).toFixed(1)}-{((comboSettings?.restBetweenCombos.max || 0) / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Start Button */}
      <div className="mt-8 max-w-lg mx-auto w-full">
        <button
          onClick={handleStartTraining}
          className="
            w-full py-5 px-8 rounded-2xl
            bg-gradient-to-r from-green-500 to-emerald-600
            text-white text-xl sm:text-2xl font-bold
            shadow-lg shadow-green-500/30
            hover:shadow-xl hover:shadow-green-500/40
            active:scale-[0.98]
            transition-all duration-200
            min-h-[72px]
          "
        >
          Start Training
        </button>
      </div>
    </div>
  );
}

export default ConfigScreen;
