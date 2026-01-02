import { describe, it, expect } from 'vitest'
import {
  calculateSessionStats,
  calculateAveragePace,
  formatTime,
  formatTimeDetailed,
  calculateHitsPerMinute,
} from './statsCalculator'

describe('statsCalculator', () => {
  describe('formatTime', () => {
    it('formats 0ms as 00:00', () => {
      expect(formatTime(0)).toBe('00:00')
    })

    it('formats seconds correctly', () => {
      expect(formatTime(5000)).toBe('00:05')
      expect(formatTime(45000)).toBe('00:45')
    })

    it('formats minutes and seconds correctly', () => {
      expect(formatTime(60000)).toBe('01:00')
      expect(formatTime(90000)).toBe('01:30')
      expect(formatTime(150000)).toBe('02:30')
    })

    it('pads single digits with leading zeros', () => {
      expect(formatTime(65000)).toBe('01:05')
    })

    it('handles negative values', () => {
      expect(formatTime(-1000)).toBe('00:00')
    })

    it('handles Infinity', () => {
      expect(formatTime(Infinity)).toBe('00:00')
    })

    it('handles NaN', () => {
      expect(formatTime(NaN)).toBe('00:00')
    })
  })

  describe('formatTimeDetailed', () => {
    it('formats with milliseconds', () => {
      expect(formatTimeDetailed(0)).toBe('00:00.000')
      expect(formatTimeDetailed(1500)).toBe('00:01.500')
      expect(formatTimeDetailed(65123)).toBe('01:05.123')
    })

    it('handles edge cases', () => {
      expect(formatTimeDetailed(-1000)).toBe('00:00.000')
      expect(formatTimeDetailed(NaN)).toBe('00:00.000')
    })
  })

  describe('calculateAveragePace', () => {
    it('returns 0 for less than 2 hits', () => {
      expect(calculateAveragePace(0, 10000)).toBe(0)
      expect(calculateAveragePace(1, 10000)).toBe(0)
    })

    it('returns 0 for zero or negative duration', () => {
      expect(calculateAveragePace(5, 0)).toBe(0)
      expect(calculateAveragePace(5, -1000)).toBe(0)
    })

    it('calculates pace correctly for 2 hits', () => {
      // 2 hits over 2000ms = 2000ms between them
      expect(calculateAveragePace(2, 2000)).toBe(2000)
    })

    it('calculates pace correctly for multiple hits', () => {
      // 5 hits over 8000ms = 4 intervals = 2000ms each
      expect(calculateAveragePace(5, 8000)).toBe(2000)
    })

    it('rounds to integer', () => {
      // 3 hits over 5000ms = 2 intervals = 2500ms each
      expect(calculateAveragePace(3, 5000)).toBe(2500)
    })
  })

  describe('calculateHitsPerMinute', () => {
    it('returns 0 for zero hits', () => {
      expect(calculateHitsPerMinute(0, 60000)).toBe(0)
    })

    it('returns 0 for zero duration', () => {
      expect(calculateHitsPerMinute(10, 0)).toBe(0)
    })

    it('calculates correctly for 1 minute duration', () => {
      expect(calculateHitsPerMinute(30, 60000)).toBe(30)
    })

    it('calculates correctly for partial minutes', () => {
      // 15 hits in 30 seconds = 30 hits per minute
      expect(calculateHitsPerMinute(15, 30000)).toBe(30)
    })

    it('rounds to 1 decimal place', () => {
      // 10 hits in 45 seconds = 13.33... hits/min -> 13.3
      expect(calculateHitsPerMinute(10, 45000)).toBe(13.3)
    })
  })

  describe('calculateSessionStats', () => {
    it('calculates all stats correctly', () => {
      const startTime = 1000
      const endTime = 61000 // 60 seconds later
      const hitsCompleted = 20
      const totalHits = 30

      const stats = calculateSessionStats(startTime, endTime, hitsCompleted, totalHits)

      expect(stats.durationMs).toBe(60000)
      expect(stats.durationFormatted).toBe('01:00')
      expect(stats.hitsCompleted).toBe(20)
      expect(stats.totalHits).toBe(30)
      expect(stats.completionRate).toBe(67) // 20/30 * 100 rounded
    })

    it('calculates 100% completion rate', () => {
      const stats = calculateSessionStats(0, 60000, 30, 30)
      expect(stats.completionRate).toBe(100)
    })

    it('handles 0 total hits', () => {
      const stats = calculateSessionStats(0, 60000, 0, 0)
      expect(stats.completionRate).toBe(0)
    })

    it('calculates average pace', () => {
      // 10 hits over 18000ms = 9 intervals = 2000ms each
      const stats = calculateSessionStats(0, 18000, 10, 10)
      expect(stats.averagePace).toBe(2000)
      expect(stats.averagePaceFormatted).toBe('2.00s')
    })

    it('handles single hit for average pace', () => {
      const stats = calculateSessionStats(0, 5000, 1, 10)
      expect(stats.averagePace).toBe(0)
      expect(stats.averagePaceFormatted).toBe('N/A')
    })
  })
})
