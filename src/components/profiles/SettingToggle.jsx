/**
 * SettingToggle - Boolean toggle switch for settings
 */

function SettingToggle({
  label,
  description,
  value,
  onChange,
  disabled = false
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0
          rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-800
          disabled:opacity-50 disabled:cursor-not-allowed
          ${value
            ? 'bg-purple-600'
            : 'bg-gray-200 dark:bg-gray-600'
          }
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5
            transform rounded-full bg-white shadow ring-0
            transition duration-200 ease-in-out
            ${value ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>

      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

export default SettingToggle
