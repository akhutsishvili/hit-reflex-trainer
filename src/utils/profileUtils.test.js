import { describe, it, expect } from 'vitest'
import {
  createDefaultProfile,
  createNewProfile,
  validateProfile,
  mergeWithDefaults,
  getRandomTotalHits,
  RECOMMENDED_VALUES,
  DEFAULT_PROFILE_ID
} from './profileUtils'

describe('profileUtils', () => {
  describe('DEFAULT_PROFILE_ID', () => {
    it('is set to "default"', () => {
      expect(DEFAULT_PROFILE_ID).toBe('default')
    })
  })

  describe('RECOMMENDED_VALUES', () => {
    it('has values for all 5 difficulty levels', () => {
      const difficultyIds = ['very-easy', 'easy', 'normal', 'hard', 'very-hard']
      difficultyIds.forEach(id => {
        expect(RECOMMENDED_VALUES[id]).toBeDefined()
      })
    })

    it('each difficulty has interval recommendations', () => {
      Object.values(RECOMMENDED_VALUES).forEach(rec => {
        expect(rec.minInterval).toBeDefined()
        expect(rec.maxInterval).toBeDefined()
        expect(rec.minInterval.min).toBeLessThan(rec.minInterval.max)
        expect(rec.maxInterval.min).toBeLessThan(rec.maxInterval.max)
      })
    })

    it('each difficulty has totalHits recommendations', () => {
      Object.values(RECOMMENDED_VALUES).forEach(rec => {
        expect(rec.totalHits).toBeDefined()
        expect(rec.totalHits.min).toBeLessThan(rec.totalHits.max)
      })
    })

    it('each difficulty has breakDuration recommendations', () => {
      Object.values(RECOMMENDED_VALUES).forEach(rec => {
        expect(rec.breakDuration).toBeDefined()
        expect(rec.breakDuration.min).toBeLessThan(rec.breakDuration.max)
      })
    })

    it('has explanation for each difficulty', () => {
      Object.values(RECOMMENDED_VALUES).forEach(rec => {
        expect(typeof rec.explanation).toBe('string')
        expect(rec.explanation.length).toBeGreaterThan(0)
      })
    })
  })

  describe('createDefaultProfile', () => {
    it('creates a profile with id "default"', () => {
      const profile = createDefaultProfile()
      expect(profile.id).toBe('default')
    })

    it('creates a profile named "Default"', () => {
      const profile = createDefaultProfile()
      expect(profile.name).toBe('Default')
    })

    it('marks the profile as default and read-only', () => {
      const profile = createDefaultProfile()
      expect(profile.isDefault).toBe(true)
      expect(profile.isReadOnly).toBe(true)
    })

    it('includes all 5 difficulty settings', () => {
      const profile = createDefaultProfile()
      expect(profile.difficulties).toHaveLength(5)
    })

    it('each difficulty has required fields', () => {
      const profile = createDefaultProfile()
      profile.difficulties.forEach(diff => {
        expect(diff.id).toBeDefined()
        expect(diff.name).toBeDefined()
        expect(diff.minInterval).toBeDefined()
        expect(diff.maxInterval).toBeDefined()
        expect(diff.totalHits).toBeDefined()
        expect(diff.totalHits.min).toBeDefined()
        expect(diff.totalHits.max).toBeDefined()
        expect(diff.combo).toBeDefined()
        expect(diff.rest).toBeDefined()
      })
    })

    it('each difficulty has valid interval range', () => {
      const profile = createDefaultProfile()
      profile.difficulties.forEach(diff => {
        expect(diff.minInterval).toBeLessThan(diff.maxInterval)
        expect(diff.minInterval).toBeGreaterThan(0)
      })
    })

    it('each difficulty has valid totalHits range', () => {
      const profile = createDefaultProfile()
      profile.difficulties.forEach(diff => {
        expect(diff.totalHits.min).toBeLessThanOrEqual(diff.totalHits.max)
        expect(diff.totalHits.min).toBeGreaterThan(0)
      })
    })

    it('each difficulty has combo settings', () => {
      const profile = createDefaultProfile()
      profile.difficulties.forEach(diff => {
        expect(diff.combo.comboSize).toBeDefined()
        expect(diff.combo.strikeInterval).toBeDefined()
        expect(diff.combo.restBetweenCombos).toBeDefined()
        expect(diff.combo.totalCombos).toBeDefined()
      })
    })

    it('each difficulty has rest settings', () => {
      const profile = createDefaultProfile()
      profile.difficulties.forEach(diff => {
        expect(typeof diff.rest.enabled).toBe('boolean')
        expect(diff.rest.breakDuration).toBeGreaterThan(0)
      })
    })
  })

  describe('createNewProfile', () => {
    it('creates a profile with a UUID', () => {
      const profile = createNewProfile('My Profile')
      expect(profile.id).toMatch(/^[0-9a-f-]{36}$/)
    })

    it('uses the provided name', () => {
      const profile = createNewProfile('Custom Training')
      expect(profile.name).toBe('Custom Training')
    })

    it('marks the profile as not default and not read-only', () => {
      const profile = createNewProfile('Test')
      expect(profile.isDefault).toBe(false)
      expect(profile.isReadOnly).toBe(false)
    })

    it('sets createdAt and updatedAt timestamps', () => {
      const before = Date.now()
      const profile = createNewProfile('Test')
      const after = Date.now()

      expect(profile.createdAt).toBeGreaterThanOrEqual(before)
      expect(profile.createdAt).toBeLessThanOrEqual(after)
      expect(profile.updatedAt).toBe(profile.createdAt)
    })

    it('includes all 5 difficulty settings from defaults', () => {
      const profile = createNewProfile('Test')
      expect(profile.difficulties).toHaveLength(5)
    })

    it('creates unique IDs for each new profile', () => {
      const profile1 = createNewProfile('Profile 1')
      const profile2 = createNewProfile('Profile 2')
      expect(profile1.id).not.toBe(profile2.id)
    })
  })

  describe('validateProfile', () => {
    it('returns no errors for valid profile', () => {
      const profile = createNewProfile('Valid')
      const result = validateProfile(profile)
      expect(result.errors).toHaveLength(0)
    })

    it('returns error for missing name', () => {
      const profile = createNewProfile('Test')
      profile.name = ''
      const result = validateProfile(profile)
      expect(result.errors).toContain('Profile name is required')
    })

    it('returns error when minInterval > maxInterval', () => {
      const profile = createNewProfile('Test')
      profile.difficulties[0].minInterval = 5000
      profile.difficulties[0].maxInterval = 1000
      const result = validateProfile(profile)
      expect(result.errors.some(e => e.includes('minInterval') && e.includes('maxInterval'))).toBe(true)
    })

    it('returns error for negative interval', () => {
      const profile = createNewProfile('Test')
      profile.difficulties[0].minInterval = -100
      const result = validateProfile(profile)
      expect(result.errors.some(e => e.includes('negative') || e.includes('positive'))).toBe(true)
    })

    it('returns error when totalHits.min > totalHits.max', () => {
      const profile = createNewProfile('Test')
      profile.difficulties[0].totalHits.min = 100
      profile.difficulties[0].totalHits.max = 10
      const result = validateProfile(profile)
      expect(result.errors.some(e => e.includes('totalHits'))).toBe(true)
    })

    it('returns error for zero totalHits', () => {
      const profile = createNewProfile('Test')
      profile.difficulties[0].totalHits.min = 0
      profile.difficulties[0].totalHits.max = 0
      const result = validateProfile(profile)
      expect(result.errors.some(e => e.includes('totalHits') || e.includes('positive'))).toBe(true)
    })

    it('returns warning when values outside recommended range', () => {
      const profile = createNewProfile('Test')
      // Set very extreme values
      profile.difficulties[0].minInterval = 100 // Way too fast for very-easy
      const result = validateProfile(profile)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('returns warnings array even when empty', () => {
      const profile = createNewProfile('Valid')
      const result = validateProfile(profile)
      expect(Array.isArray(result.warnings)).toBe(true)
    })
  })

  describe('mergeWithDefaults', () => {
    it('returns a complete profile when given partial data', () => {
      const partial = {
        id: 'test-id',
        name: 'Partial Profile',
        difficulties: []
      }
      const merged = mergeWithDefaults(partial)
      expect(merged.difficulties).toHaveLength(5)
    })

    it('preserves custom values', () => {
      const profile = createNewProfile('Test')
      profile.difficulties[0].minInterval = 9999
      const merged = mergeWithDefaults(profile)
      expect(merged.difficulties[0].minInterval).toBe(9999)
    })

    it('fills missing difficulty fields with defaults', () => {
      const profile = createNewProfile('Test')
      delete profile.difficulties[0].rest
      const merged = mergeWithDefaults(profile)
      expect(merged.difficulties[0].rest).toBeDefined()
      expect(merged.difficulties[0].rest.enabled).toBe(true)
    })

    it('adds missing difficulties', () => {
      const profile = createNewProfile('Test')
      profile.difficulties = profile.difficulties.slice(0, 2)
      const merged = mergeWithDefaults(profile)
      expect(merged.difficulties).toHaveLength(5)
    })

    it('preserves profile metadata', () => {
      const profile = createNewProfile('My Custom')
      profile.updatedAt = 12345
      const merged = mergeWithDefaults(profile)
      expect(merged.name).toBe('My Custom')
      expect(merged.id).toBe(profile.id)
    })
  })

  describe('getRandomTotalHits', () => {
    it('returns value within range', () => {
      const totalHits = { min: 20, max: 30 }
      for (let i = 0; i < 50; i++) {
        const result = getRandomTotalHits(totalHits)
        expect(result).toBeGreaterThanOrEqual(20)
        expect(result).toBeLessThanOrEqual(30)
      }
    })

    it('returns integer values', () => {
      const totalHits = { min: 15, max: 25 }
      for (let i = 0; i < 20; i++) {
        const result = getRandomTotalHits(totalHits)
        expect(Number.isInteger(result)).toBe(true)
      }
    })

    it('returns exact value when min equals max', () => {
      const totalHits = { min: 45, max: 45 }
      const result = getRandomTotalHits(totalHits)
      expect(result).toBe(45)
    })

    it('returns varied values for range', () => {
      const totalHits = { min: 10, max: 50 }
      const results = new Set()
      for (let i = 0; i < 50; i++) {
        results.add(getRandomTotalHits(totalHits))
      }
      expect(results.size).toBeGreaterThan(1)
    })
  })
})
