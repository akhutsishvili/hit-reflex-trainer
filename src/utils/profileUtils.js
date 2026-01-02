/**
 * Profile Utilities for Combat Reflex Training App
 *
 * Provides functions for creating, validating, and managing training profiles.
 * Profiles allow users to customize difficulty settings beyond the defaults.
 */

import {
  DIFFICULTIES,
  COMBO_SETTINGS,
  BREAK_DURATION_MS
} from './difficultyConfig'

/**
 * Default profile ID constant
 */
export const DEFAULT_PROFILE_ID = 'default'

/**
 * Recommended values for each difficulty level
 * Used to show warnings when user sets values outside recommended ranges
 */
export const RECOMMENDED_VALUES = {
  'very-easy': {
    minInterval: { min: 2000, max: 3000 },
    maxInterval: { min: 3500, max: 5000 },
    totalHits: { min: 15, max: 20 },
    breakDuration: { min: 30000, max: 45000 },
    explanation: 'Beginner-friendly, allows full recovery between strikes'
  },
  'easy': {
    minInterval: { min: 1200, max: 1800 },
    maxInterval: { min: 2200, max: 3000 },
    totalHits: { min: 25, max: 35 },
    breakDuration: { min: 25000, max: 35000 },
    explanation: 'Gentle warmup progression for building stamina'
  },
  'normal': {
    minInterval: { min: 800, max: 1200 },
    maxInterval: { min: 1500, max: 2000 },
    totalHits: { min: 40, max: 50 },
    breakDuration: { min: 20000, max: 30000 },
    explanation: 'Balanced challenge for regular training sessions'
  },
  'hard': {
    minInterval: { min: 500, max: 800 },
    maxInterval: { min: 1000, max: 1400 },
    totalHits: { min: 60, max: 75 },
    breakDuration: { min: 15000, max: 25000 },
    explanation: 'Fast reactions required, high intensity workout'
  },
  'very-hard': {
    minInterval: { min: 200, max: 400 },
    maxInterval: { min: 600, max: 1000 },
    totalHits: { min: 85, max: 100 },
    breakDuration: { min: 10000, max: 20000 },
    explanation: 'Elite level training with minimal rest between strikes'
  }
}

/**
 * Generates a UUID for profile identification
 * @returns {string} UUID string
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Creates a difficulty settings object from the default configuration
 * @param {Object} difficulty - Difficulty from DIFFICULTIES array
 * @param {Object} comboSettings - Combo settings from COMBO_SETTINGS array
 * @returns {Object} DifficultySettings object
 */
function createDifficultySettings(difficulty, comboSettings) {
  return {
    id: difficulty.id,
    name: difficulty.name,
    minInterval: difficulty.minInterval,
    maxInterval: difficulty.maxInterval,
    totalHits: {
      min: difficulty.totalHits,
      max: difficulty.totalHits
    },
    combo: {
      comboSize: { ...comboSettings.comboSize },
      strikeInterval: { ...comboSettings.strikeInterval },
      restBetweenCombos: { ...comboSettings.restBetweenCombos },
      totalCombos: comboSettings.totalCombos
    },
    rest: {
      enabled: true,
      breakDuration: BREAK_DURATION_MS
    }
  }
}

/**
 * Creates the default profile from current DIFFICULTIES configuration
 * This profile is read-only and represents the built-in defaults
 * @returns {Object} Default TrainingProfile
 */
export function createDefaultProfile() {
  const difficulties = DIFFICULTIES.map((diff, index) => {
    const comboSettings = COMBO_SETTINGS[index]
    return createDifficultySettings(diff, comboSettings)
  })

  return {
    id: DEFAULT_PROFILE_ID,
    name: 'Default',
    isDefault: true,
    isReadOnly: true,
    createdAt: 0,
    updatedAt: 0,
    difficulties
  }
}

/**
 * Creates a new custom profile with default values
 * @param {string} name - Name for the new profile
 * @returns {Object} New TrainingProfile
 */
export function createNewProfile(name) {
  const defaultProfile = createDefaultProfile()
  const now = Date.now()

  return {
    id: generateUUID(),
    name,
    isDefault: false,
    isReadOnly: false,
    createdAt: now,
    updatedAt: now,
    difficulties: defaultProfile.difficulties.map(diff => ({
      ...diff,
      totalHits: { ...diff.totalHits },
      combo: {
        ...diff.combo,
        comboSize: { ...diff.combo.comboSize },
        strikeInterval: { ...diff.combo.strikeInterval },
        restBetweenCombos: { ...diff.combo.restBetweenCombos }
      },
      rest: { ...diff.rest }
    }))
  }
}

/**
 * Validates a profile and returns errors and warnings
 * @param {Object} profile - Profile to validate
 * @returns {{errors: string[], warnings: string[]}} Validation result
 */
export function validateProfile(profile) {
  const errors = []
  const warnings = []

  // Validate name
  if (!profile.name || profile.name.trim() === '') {
    errors.push('Profile name is required')
  }

  // Validate each difficulty
  profile.difficulties?.forEach((diff, index) => {
    const diffName = diff.name || `Difficulty ${index + 1}`
    const recommended = RECOMMENDED_VALUES[diff.id]

    // Interval validation
    if (diff.minInterval <= 0) {
      errors.push(`${diffName}: minInterval must be positive`)
    }
    if (diff.maxInterval <= 0) {
      errors.push(`${diffName}: maxInterval must be positive`)
    }
    if (diff.minInterval > diff.maxInterval) {
      errors.push(`${diffName}: minInterval cannot be greater than maxInterval`)
    }

    // Total hits validation
    if (diff.totalHits) {
      if (diff.totalHits.min <= 0 || diff.totalHits.max <= 0) {
        errors.push(`${diffName}: totalHits must be positive`)
      }
      if (diff.totalHits.min > diff.totalHits.max) {
        errors.push(`${diffName}: totalHits min cannot be greater than max`)
      }
    }

    // Rest settings validation
    if (diff.rest) {
      if (diff.rest.breakDuration < 0) {
        errors.push(`${diffName}: breakDuration cannot be negative`)
      }
    }

    // Warnings for values outside recommended range
    if (recommended) {
      if (diff.minInterval < recommended.minInterval.min) {
        warnings.push(`${diffName}: minInterval (${diff.minInterval}ms) is below recommended minimum (${recommended.minInterval.min}ms)`)
      }
      if (diff.minInterval > recommended.minInterval.max) {
        warnings.push(`${diffName}: minInterval (${diff.minInterval}ms) is above recommended maximum (${recommended.minInterval.max}ms)`)
      }
      if (diff.maxInterval < recommended.maxInterval.min) {
        warnings.push(`${diffName}: maxInterval (${diff.maxInterval}ms) is below recommended minimum (${recommended.maxInterval.min}ms)`)
      }
      if (diff.maxInterval > recommended.maxInterval.max) {
        warnings.push(`${diffName}: maxInterval (${diff.maxInterval}ms) is above recommended maximum (${recommended.maxInterval.max}ms)`)
      }
    }
  })

  return { errors, warnings }
}

/**
 * Merges a partial profile with defaults to ensure all fields exist
 * @param {Object} partial - Partial profile data
 * @returns {Object} Complete profile with all fields
 */
export function mergeWithDefaults(partial) {
  const defaultProfile = createDefaultProfile()

  // Ensure we have all difficulties
  const mergedDifficulties = defaultProfile.difficulties.map(defaultDiff => {
    const customDiff = partial.difficulties?.find(d => d.id === defaultDiff.id)

    if (!customDiff) {
      return { ...defaultDiff }
    }

    return {
      id: customDiff.id || defaultDiff.id,
      name: customDiff.name || defaultDiff.name,
      minInterval: customDiff.minInterval ?? defaultDiff.minInterval,
      maxInterval: customDiff.maxInterval ?? defaultDiff.maxInterval,
      totalHits: customDiff.totalHits ? {
        min: customDiff.totalHits.min ?? defaultDiff.totalHits.min,
        max: customDiff.totalHits.max ?? defaultDiff.totalHits.max
      } : { ...defaultDiff.totalHits },
      combo: customDiff.combo ? {
        comboSize: customDiff.combo.comboSize ? {
          min: customDiff.combo.comboSize.min ?? defaultDiff.combo.comboSize.min,
          max: customDiff.combo.comboSize.max ?? defaultDiff.combo.comboSize.max
        } : { ...defaultDiff.combo.comboSize },
        strikeInterval: customDiff.combo.strikeInterval ? {
          min: customDiff.combo.strikeInterval.min ?? defaultDiff.combo.strikeInterval.min,
          max: customDiff.combo.strikeInterval.max ?? defaultDiff.combo.strikeInterval.max
        } : { ...defaultDiff.combo.strikeInterval },
        restBetweenCombos: customDiff.combo.restBetweenCombos ? {
          min: customDiff.combo.restBetweenCombos.min ?? defaultDiff.combo.restBetweenCombos.min,
          max: customDiff.combo.restBetweenCombos.max ?? defaultDiff.combo.restBetweenCombos.max
        } : { ...defaultDiff.combo.restBetweenCombos },
        totalCombos: customDiff.combo.totalCombos ?? defaultDiff.combo.totalCombos
      } : { ...defaultDiff.combo },
      rest: customDiff.rest ? {
        enabled: customDiff.rest.enabled ?? defaultDiff.rest.enabled,
        breakDuration: customDiff.rest.breakDuration ?? defaultDiff.rest.breakDuration
      } : { ...defaultDiff.rest }
    }
  })

  return {
    id: partial.id || generateUUID(),
    name: partial.name || 'Unnamed Profile',
    isDefault: partial.isDefault ?? false,
    isReadOnly: partial.isReadOnly ?? false,
    createdAt: partial.createdAt ?? Date.now(),
    updatedAt: partial.updatedAt ?? Date.now(),
    difficulties: mergedDifficulties
  }
}

/**
 * Gets a random total hits value from a range
 * @param {{min: number, max: number}} totalHits - Range object
 * @returns {number} Random integer within range
 */
export function getRandomTotalHits(totalHits) {
  const { min, max } = totalHits
  return Math.floor(Math.random() * (max - min + 1)) + min
}
