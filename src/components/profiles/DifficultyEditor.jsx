/**
 * DifficultyEditor - Collapsible section for editing one difficulty level's settings
 */

import { useState } from 'react'
import SettingInput from './SettingInput'
import SettingToggle from './SettingToggle'
import { RECOMMENDED_VALUES } from '../../utils/profileUtils'

function DifficultyEditor({
  difficulty,
  onChange,
  onReset,
  isReadOnly = false
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const recommended = RECOMMENDED_VALUES[difficulty.id]

  const updateField = (field, value) => {
    onChange({ ...difficulty, [field]: value })
  }

  const updateNestedField = (parent, field, value) => {
    onChange({
      ...difficulty,
      [parent]: { ...difficulty[parent], [field]: value }
    })
  }

  const updateRangeField = (parent, field, subfield, value) => {
    onChange({
      ...difficulty,
      [parent]: {
        ...difficulty[parent],
        [field]: {
          ...difficulty[parent][field],
          [subfield]: value
        }
      }
    })
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          w-full px-4 py-3
          flex items-center justify-between
          bg-gray-50 dark:bg-gray-800/50
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-colors
        "
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {difficulty.name}
          </span>
        </div>

        {!isReadOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onReset()
            }}
            className="
              text-xs px-2 py-1 rounded
              text-gray-500 dark:text-gray-400
              hover:text-purple-600 dark:hover:text-purple-400
              hover:bg-purple-50 dark:hover:bg-purple-900/20
              transition-colors
            "
          >
            Reset
          </button>
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-6 bg-white dark:bg-gray-800">
          {/* Recommendation info */}
          {recommended?.explanation && (
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-sm text-purple-700 dark:text-purple-300">
              {recommended.explanation}
            </div>
          )}

          {/* Timing Settings */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Timing
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <SettingInput
                label="Min Interval"
                value={difficulty.minInterval}
                onChange={(v) => updateField('minInterval', v)}
                min={100}
                max={10000}
                step={100}
                unit="ms"
                recommended={recommended?.minInterval}
                disabled={isReadOnly}
              />
              <SettingInput
                label="Max Interval"
                value={difficulty.maxInterval}
                onChange={(v) => updateField('maxInterval', v)}
                min={100}
                max={10000}
                step={100}
                unit="ms"
                recommended={recommended?.maxInterval}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Hits Settings */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Hits per Session
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <SettingInput
                label="Minimum"
                value={difficulty.totalHits?.min || difficulty.totalHits}
                onChange={(v) => {
                  if (typeof difficulty.totalHits === 'object') {
                    updateNestedField('totalHits', 'min', v)
                  } else {
                    updateField('totalHits', { min: v, max: difficulty.totalHits || v })
                  }
                }}
                min={1}
                max={200}
                step={1}
                recommended={recommended?.totalHits}
                disabled={isReadOnly}
              />
              <SettingInput
                label="Maximum"
                value={difficulty.totalHits?.max || difficulty.totalHits}
                onChange={(v) => {
                  if (typeof difficulty.totalHits === 'object') {
                    updateNestedField('totalHits', 'max', v)
                  } else {
                    updateField('totalHits', { min: difficulty.totalHits || v, max: v })
                  }
                }}
                min={1}
                max={200}
                step={1}
                recommended={recommended?.totalHits}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Combo Settings */}
          {difficulty.combo && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                Combo Mode
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <SettingInput
                    label="Min Combo Size"
                    value={difficulty.combo.comboSize?.min}
                    onChange={(v) => updateRangeField('combo', 'comboSize', 'min', v)}
                    min={1}
                    max={10}
                    step={1}
                    disabled={isReadOnly}
                  />
                  <SettingInput
                    label="Max Combo Size"
                    value={difficulty.combo.comboSize?.max}
                    onChange={(v) => updateRangeField('combo', 'comboSize', 'max', v)}
                    min={1}
                    max={10}
                    step={1}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SettingInput
                    label="Strike Interval Min"
                    value={difficulty.combo.strikeInterval?.min}
                    onChange={(v) => updateRangeField('combo', 'strikeInterval', 'min', v)}
                    min={100}
                    max={2000}
                    step={50}
                    unit="ms"
                    disabled={isReadOnly}
                  />
                  <SettingInput
                    label="Strike Interval Max"
                    value={difficulty.combo.strikeInterval?.max}
                    onChange={(v) => updateRangeField('combo', 'strikeInterval', 'max', v)}
                    min={100}
                    max={2000}
                    step={50}
                    unit="ms"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SettingInput
                    label="Rest Between Min"
                    value={difficulty.combo.restBetweenCombos?.min}
                    onChange={(v) => updateRangeField('combo', 'restBetweenCombos', 'min', v)}
                    min={500}
                    max={10000}
                    step={500}
                    unit="ms"
                    disabled={isReadOnly}
                  />
                  <SettingInput
                    label="Rest Between Max"
                    value={difficulty.combo.restBetweenCombos?.max}
                    onChange={(v) => updateRangeField('combo', 'restBetweenCombos', 'max', v)}
                    min={500}
                    max={10000}
                    step={500}
                    unit="ms"
                    disabled={isReadOnly}
                  />
                </div>
                <SettingInput
                  label="Total Combos"
                  value={difficulty.combo.totalCombos}
                  onChange={(v) => updateNestedField('combo', 'totalCombos', v)}
                  min={1}
                  max={50}
                  step={1}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          )}

          {/* Rest Settings */}
          {difficulty.rest && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                Session Breaks
              </h4>
              <div className="space-y-4">
                <SettingToggle
                  label="Enable Breaks"
                  description="Take breaks between sessions in multi-session training"
                  value={difficulty.rest.enabled}
                  onChange={(v) => updateNestedField('rest', 'enabled', v)}
                  disabled={isReadOnly}
                />
                {difficulty.rest.enabled && (
                  <SettingInput
                    label="Break Duration"
                    value={Math.round(difficulty.rest.breakDuration / 1000)}
                    onChange={(v) => updateNestedField('rest', 'breakDuration', v * 1000)}
                    min={5}
                    max={120}
                    step={5}
                    unit="seconds"
                    recommended={recommended?.breakDuration ? {
                      min: Math.round(recommended.breakDuration.min / 1000),
                      max: Math.round(recommended.breakDuration.max / 1000)
                    } : undefined}
                    disabled={isReadOnly}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DifficultyEditor
