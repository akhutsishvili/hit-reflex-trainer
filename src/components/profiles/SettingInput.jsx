/**
 * SettingInput - Reusable number input with label and recommended value display
 */

function SettingInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  recommended,
  unit = '',
  disabled = false
}) {
  const isOutsideRecommended = recommended && (
    value < recommended.min || value > recommended.max
  )

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`
            w-full px-3 py-2 rounded-lg
            border
            ${isOutsideRecommended
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
            }
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2
            ${isOutsideRecommended
              ? 'focus:ring-amber-500'
              : 'focus:ring-purple-500'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          `}
        />
        {unit && (
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {unit}
          </span>
        )}
      </div>

      {/* Recommended value hint */}
      {recommended && (
        <p className={`text-xs ${isOutsideRecommended ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>
          Recommended: {recommended.min}-{recommended.max}{unit ? ` ${unit}` : ''}
          {isOutsideRecommended && ' (outside recommended range)'}
        </p>
      )}
    </div>
  )
}

export default SettingInput
