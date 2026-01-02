import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  playPunchSound,
  playKickSound,
  playSessionStartSound,
  playSessionEndSound,
  playWarningSound,
  createAudioContext,
  resumeAudioContext,
} from './audioSynthesizer'

describe('audioSynthesizer', () => {
  let audioContext

  beforeEach(() => {
    audioContext = createAudioContext()
  })

  describe('createAudioContext', () => {
    it('creates an AudioContext instance', () => {
      const ctx = createAudioContext()
      expect(ctx).toBeDefined()
      expect(ctx.createOscillator).toBeDefined()
      expect(ctx.createGain).toBeDefined()
    })
  })

  describe('resumeAudioContext', () => {
    it('returns the audio context', async () => {
      const result = await resumeAudioContext(audioContext)
      expect(result).toBe(audioContext)
    })

    it('handles null context gracefully', async () => {
      const result = await resumeAudioContext(null)
      expect(result).toBeNull()
    })
  })

  describe('playPunchSound', () => {
    it('does not throw when called with valid context', () => {
      expect(() => playPunchSound(audioContext)).not.toThrow()
    })

    it('handles null context gracefully', () => {
      expect(() => playPunchSound(null)).not.toThrow()
    })

    it('handles undefined context gracefully', () => {
      expect(() => playPunchSound(undefined)).not.toThrow()
    })
  })

  describe('playKickSound', () => {
    it('does not throw when called with valid context', () => {
      expect(() => playKickSound(audioContext)).not.toThrow()
    })

    it('handles null context gracefully', () => {
      expect(() => playKickSound(null)).not.toThrow()
    })
  })

  describe('playSessionStartSound', () => {
    it('does not throw when called with valid context', () => {
      expect(() => playSessionStartSound(audioContext)).not.toThrow()
    })

    it('handles null context gracefully', () => {
      expect(() => playSessionStartSound(null)).not.toThrow()
    })
  })

  describe('playSessionEndSound', () => {
    it('does not throw when called with valid context', () => {
      expect(() => playSessionEndSound(audioContext)).not.toThrow()
    })

    it('handles null context gracefully', () => {
      expect(() => playSessionEndSound(null)).not.toThrow()
    })
  })

  describe('playWarningSound', () => {
    it('does not throw when called with valid context', () => {
      expect(() => playWarningSound(audioContext)).not.toThrow()
    })

    it('handles null context gracefully', () => {
      expect(() => playWarningSound(null)).not.toThrow()
    })
  })

  describe('sound functions use correct audio graph', () => {
    it('punch sound creates oscillator', () => {
      const createOscillator = vi.spyOn(audioContext, 'createOscillator')
      playPunchSound(audioContext)
      expect(createOscillator).toHaveBeenCalled()
    })

    it('kick sound creates oscillator', () => {
      const createOscillator = vi.spyOn(audioContext, 'createOscillator')
      playKickSound(audioContext)
      expect(createOscillator).toHaveBeenCalled()
    })

    it('session start creates multiple oscillators', () => {
      const createOscillator = vi.spyOn(audioContext, 'createOscillator')
      playSessionStartSound(audioContext)
      expect(createOscillator).toHaveBeenCalledTimes(2)
    })

    it('session end creates multiple oscillators', () => {
      const createOscillator = vi.spyOn(audioContext, 'createOscillator')
      playSessionEndSound(audioContext)
      expect(createOscillator).toHaveBeenCalledTimes(2)
    })

    it('warning creates three oscillators for three beeps', () => {
      const createOscillator = vi.spyOn(audioContext, 'createOscillator')
      playWarningSound(audioContext)
      expect(createOscillator).toHaveBeenCalledTimes(3)
    })
  })
})
