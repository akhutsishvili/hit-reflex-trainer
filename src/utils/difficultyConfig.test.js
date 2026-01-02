import { describe, it, expect } from 'vitest'
import {
  DIFFICULTIES,
  getRandomInterval,
  TRAINING_MODES,
  TRAINING_TYPES,
  COMBO_SETTINGS,
  getComboSettings,
  getRandomComboSize,
  getRandomStrikeInterval,
  getRandomComboRest,
  SESSION_DURATION_MS,
  BREAK_DURATION_MS,
  MID_REST_DURATION_MS,
  DEFAULT_DIFFICULTY,
  getDifficultyById,
} from './difficultyConfig'

describe('difficultyConfig', () => {
  describe('DIFFICULTIES', () => {
    it('has 5 difficulty levels', () => {
      expect(DIFFICULTIES).toHaveLength(5)
    })

    it('includes all expected difficulty names', () => {
      const names = DIFFICULTIES.map(d => d.name)
      expect(names).toEqual(['Very Easy', 'Easy', 'Normal', 'Hard', 'Very Hard'])
    })

    it('has increasing total hits as difficulty increases', () => {
      const hits = DIFFICULTIES.map(d => d.totalHits)
      for (let i = 1; i < hits.length; i++) {
        expect(hits[i]).toBeGreaterThan(hits[i - 1])
      }
    })

    it('has decreasing intervals as difficulty increases', () => {
      for (let i = 1; i < DIFFICULTIES.length; i++) {
        expect(DIFFICULTIES[i].maxInterval).toBeLessThan(DIFFICULTIES[i - 1].maxInterval)
      }
    })

    it('each difficulty has valid min/max interval range', () => {
      DIFFICULTIES.forEach(d => {
        expect(d.minInterval).toBeLessThan(d.maxInterval)
        expect(d.minInterval).toBeGreaterThan(0)
      })
    })
  })

  describe('getRandomInterval', () => {
    it('returns value within difficulty range', () => {
      const difficulty = DIFFICULTIES[2] // Normal
      for (let i = 0; i < 100; i++) {
        const interval = getRandomInterval(difficulty)
        expect(interval).toBeGreaterThanOrEqual(difficulty.minInterval)
        expect(interval).toBeLessThanOrEqual(difficulty.maxInterval)
      }
    })

    it('returns integer values', () => {
      const difficulty = DIFFICULTIES[0]
      for (let i = 0; i < 20; i++) {
        const interval = getRandomInterval(difficulty)
        expect(Number.isInteger(interval)).toBe(true)
      }
    })
  })

  describe('TRAINING_MODES', () => {
    it('includes punches, kicks, and both', () => {
      expect(TRAINING_MODES).toContain('punches')
      expect(TRAINING_MODES).toContain('kicks')
      expect(TRAINING_MODES).toContain('both')
    })

    it('has exactly 3 modes', () => {
      expect(TRAINING_MODES).toHaveLength(3)
    })
  })

  describe('timing constants', () => {
    it('SESSION_DURATION_MS is 2 minutes', () => {
      expect(SESSION_DURATION_MS).toBe(120000)
    })

    it('BREAK_DURATION_MS is 30 seconds', () => {
      expect(BREAK_DURATION_MS).toBe(30000)
    })

    it('MID_REST_DURATION_MS is 7 seconds', () => {
      expect(MID_REST_DURATION_MS).toBe(7000)
    })
  })

  describe('DEFAULT_DIFFICULTY', () => {
    it('is set to Normal difficulty', () => {
      expect(DEFAULT_DIFFICULTY.id).toBe('normal')
      expect(DEFAULT_DIFFICULTY.name).toBe('Normal')
    })
  })

  describe('getDifficultyById', () => {
    it('returns correct difficulty for valid id', () => {
      const easy = getDifficultyById('easy')
      expect(easy.name).toBe('Easy')
      expect(easy.totalHits).toBe(30)
    })

    it('returns undefined for invalid id', () => {
      expect(getDifficultyById('invalid')).toBeUndefined()
    })

    it('finds all difficulty levels by id', () => {
      DIFFICULTIES.forEach(d => {
        const found = getDifficultyById(d.id)
        expect(found).toBe(d)
      })
    })
  })

  describe('TRAINING_TYPES', () => {
    it('includes single and combo', () => {
      expect(TRAINING_TYPES).toContain('single')
      expect(TRAINING_TYPES).toContain('combo')
    })

    it('has exactly 2 types', () => {
      expect(TRAINING_TYPES).toHaveLength(2)
    })
  })

  describe('COMBO_SETTINGS', () => {
    it('has settings for all 5 difficulty levels', () => {
      expect(COMBO_SETTINGS).toHaveLength(5)
    })

    it('has matching ids with DIFFICULTIES', () => {
      const difficultyIds = DIFFICULTIES.map(d => d.id)
      const comboIds = COMBO_SETTINGS.map(c => c.id)
      expect(comboIds).toEqual(difficultyIds)
    })

    it('each setting has valid comboSize range', () => {
      COMBO_SETTINGS.forEach(c => {
        expect(c.comboSize.min).toBeGreaterThan(0)
        expect(c.comboSize.max).toBeGreaterThanOrEqual(c.comboSize.min)
      })
    })

    it('each setting has valid strikeInterval range', () => {
      COMBO_SETTINGS.forEach(c => {
        expect(c.strikeInterval.min).toBeGreaterThan(0)
        expect(c.strikeInterval.max).toBeGreaterThanOrEqual(c.strikeInterval.min)
      })
    })

    it('each setting has valid restBetweenCombos range', () => {
      COMBO_SETTINGS.forEach(c => {
        expect(c.restBetweenCombos.min).toBeGreaterThan(0)
        expect(c.restBetweenCombos.max).toBeGreaterThanOrEqual(c.restBetweenCombos.min)
      })
    })

    it('combo size increases with difficulty', () => {
      for (let i = 1; i < COMBO_SETTINGS.length; i++) {
        expect(COMBO_SETTINGS[i].comboSize.max).toBeGreaterThanOrEqual(COMBO_SETTINGS[i - 1].comboSize.max)
      }
    })

    it('strike interval decreases with difficulty', () => {
      for (let i = 1; i < COMBO_SETTINGS.length; i++) {
        expect(COMBO_SETTINGS[i].strikeInterval.max).toBeLessThanOrEqual(COMBO_SETTINGS[i - 1].strikeInterval.max)
      }
    })
  })

  describe('getComboSettings', () => {
    it('returns correct settings for valid difficulty id', () => {
      const normal = getComboSettings('normal')
      expect(normal.id).toBe('normal')
      expect(normal.comboSize).toBeDefined()
      expect(normal.totalCombos).toBe(15)
    })

    it('returns undefined for invalid id', () => {
      expect(getComboSettings('invalid')).toBeUndefined()
    })

    it('finds settings for all difficulties', () => {
      DIFFICULTIES.forEach(d => {
        const settings = getComboSettings(d.id)
        expect(settings).toBeDefined()
        expect(settings.id).toBe(d.id)
      })
    })
  })

  describe('getRandomComboSize', () => {
    it('returns value within config range', () => {
      const config = COMBO_SETTINGS[2] // Normal: 3-3
      for (let i = 0; i < 50; i++) {
        const size = getRandomComboSize(config)
        expect(size).toBeGreaterThanOrEqual(config.comboSize.min)
        expect(size).toBeLessThanOrEqual(config.comboSize.max)
      }
    })

    it('returns integer values', () => {
      const config = COMBO_SETTINGS[3] // Hard: 3-4
      for (let i = 0; i < 20; i++) {
        const size = getRandomComboSize(config)
        expect(Number.isInteger(size)).toBe(true)
      }
    })

    it('returns varied values for range configs', () => {
      const config = COMBO_SETTINGS[4] // Very Hard: 4-5
      const sizes = new Set()
      for (let i = 0; i < 50; i++) {
        sizes.add(getRandomComboSize(config))
      }
      expect(sizes.size).toBeGreaterThan(1)
    })
  })

  describe('getRandomStrikeInterval', () => {
    it('returns value within config range', () => {
      const config = COMBO_SETTINGS[2] // Normal
      for (let i = 0; i < 50; i++) {
        const interval = getRandomStrikeInterval(config)
        expect(interval).toBeGreaterThanOrEqual(config.strikeInterval.min)
        expect(interval).toBeLessThanOrEqual(config.strikeInterval.max)
      }
    })

    it('returns integer values', () => {
      const config = COMBO_SETTINGS[0]
      for (let i = 0; i < 20; i++) {
        const interval = getRandomStrikeInterval(config)
        expect(Number.isInteger(interval)).toBe(true)
      }
    })
  })

  describe('getRandomComboRest', () => {
    it('returns value within config range', () => {
      const config = COMBO_SETTINGS[2] // Normal
      for (let i = 0; i < 50; i++) {
        const rest = getRandomComboRest(config)
        expect(rest).toBeGreaterThanOrEqual(config.restBetweenCombos.min)
        expect(rest).toBeLessThanOrEqual(config.restBetweenCombos.max)
      }
    })

    it('returns integer values', () => {
      const config = COMBO_SETTINGS[0]
      for (let i = 0; i < 20; i++) {
        const rest = getRandomComboRest(config)
        expect(Number.isInteger(rest)).toBe(true)
      }
    })
  })
})
