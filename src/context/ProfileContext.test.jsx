import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ProfileProvider, useProfiles } from './ProfileContext'
import { DEFAULT_PROFILE_ID } from '../utils/profileUtils'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('ProfileContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  const wrapper = ({ children }) => <ProfileProvider>{children}</ProfileProvider>

  describe('initial state', () => {
    it('provides profiles array', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      expect(Array.isArray(result.current.profiles)).toBe(true)
    })

    it('has default profile as active by default', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      expect(result.current.activeProfileId).toBe(DEFAULT_PROFILE_ID)
    })

    it('provides default profile in profiles list', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      const defaultProfile = result.current.profiles.find(p => p.id === DEFAULT_PROFILE_ID)
      expect(defaultProfile).toBeDefined()
      expect(defaultProfile.isDefault).toBe(true)
      expect(defaultProfile.isReadOnly).toBe(true)
    })

    it('provides activeProfile object', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      expect(result.current.activeProfile).toBeDefined()
      expect(result.current.activeProfile.id).toBe(DEFAULT_PROFILE_ID)
    })
  })

  describe('getEffectiveSettings', () => {
    it('returns settings for valid difficulty id', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      const settings = result.current.getEffectiveSettings('normal')
      expect(settings).toBeDefined()
      expect(settings.id).toBe('normal')
    })

    it('returns undefined for invalid difficulty id', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      const settings = result.current.getEffectiveSettings('invalid')
      expect(settings).toBeUndefined()
    })

    it('returns settings with totalHits range', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      const settings = result.current.getEffectiveSettings('normal')
      expect(settings.totalHits).toBeDefined()
      expect(settings.totalHits.min).toBeDefined()
      expect(settings.totalHits.max).toBeDefined()
    })

    it('returns settings with rest configuration', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      const settings = result.current.getEffectiveSettings('normal')
      expect(settings.rest).toBeDefined()
      expect(typeof settings.rest.enabled).toBe('boolean')
      expect(settings.rest.breakDuration).toBeGreaterThan(0)
    })
  })

  describe('getEffectiveComboSettings', () => {
    it('returns combo settings for valid difficulty id', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      const settings = result.current.getEffectiveComboSettings('normal')
      expect(settings).toBeDefined()
      expect(settings.comboSize).toBeDefined()
      expect(settings.strikeInterval).toBeDefined()
      expect(settings.restBetweenCombos).toBeDefined()
      expect(settings.totalCombos).toBeDefined()
    })

    it('returns undefined for invalid difficulty id', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      const settings = result.current.getEffectiveComboSettings('invalid')
      expect(settings).toBeUndefined()
    })
  })

  describe('createProfile', () => {
    it('creates a new profile with the given name', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })

      act(() => {
        result.current.createProfile('My Custom Profile')
      })

      const customProfile = result.current.profiles.find(p => p.name === 'My Custom Profile')
      expect(customProfile).toBeDefined()
      expect(customProfile.isDefault).toBe(false)
      expect(customProfile.isReadOnly).toBe(false)
    })

    it('returns the new profile id', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      let newId

      act(() => {
        newId = result.current.createProfile('Test Profile')
      })

      expect(newId).toBeDefined()
      expect(result.current.profiles.find(p => p.id === newId)).toBeDefined()
    })

    it('persists to localStorage', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })

      act(() => {
        result.current.createProfile('Persistent Profile')
      })

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('updateProfile', () => {
    it('updates an existing custom profile', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      let profileId

      act(() => {
        profileId = result.current.createProfile('Original Name')
      })

      const profile = result.current.profiles.find(p => p.id === profileId)

      act(() => {
        result.current.updateProfile({
          ...profile,
          name: 'Updated Name'
        })
      })

      const updated = result.current.profiles.find(p => p.id === profileId)
      expect(updated.name).toBe('Updated Name')
    })

    it('does not update default profile', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      const defaultProfile = result.current.profiles.find(p => p.isDefault)

      act(() => {
        result.current.updateProfile({
          ...defaultProfile,
          name: 'Hacked Default'
        })
      })

      const stillDefault = result.current.profiles.find(p => p.id === DEFAULT_PROFILE_ID)
      expect(stillDefault.name).toBe('Default')
    })

    it('updates difficulty settings', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      let profileId

      act(() => {
        profileId = result.current.createProfile('Test')
      })

      const profile = result.current.profiles.find(p => p.id === profileId)
      const updatedProfile = {
        ...profile,
        difficulties: profile.difficulties.map(d =>
          d.id === 'normal'
            ? { ...d, minInterval: 9999 }
            : d
        )
      }

      act(() => {
        result.current.updateProfile(updatedProfile)
      })

      const updated = result.current.profiles.find(p => p.id === profileId)
      const normalDiff = updated.difficulties.find(d => d.id === 'normal')
      expect(normalDiff.minInterval).toBe(9999)
    })
  })

  describe('deleteProfile', () => {
    it('removes a custom profile', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      let profileId

      act(() => {
        profileId = result.current.createProfile('To Delete')
      })

      expect(result.current.profiles.find(p => p.id === profileId)).toBeDefined()

      act(() => {
        result.current.deleteProfile(profileId)
      })

      expect(result.current.profiles.find(p => p.id === profileId)).toBeUndefined()
    })

    it('does not delete default profile', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      const initialLength = result.current.profiles.length

      act(() => {
        result.current.deleteProfile(DEFAULT_PROFILE_ID)
      })

      expect(result.current.profiles.length).toBe(initialLength)
      expect(result.current.profiles.find(p => p.isDefault)).toBeDefined()
    })

    it('switches to default if deleted profile was active', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      let profileId

      act(() => {
        profileId = result.current.createProfile('Active Profile')
        result.current.setActiveProfile(profileId)
      })

      expect(result.current.activeProfileId).toBe(profileId)

      act(() => {
        result.current.deleteProfile(profileId)
      })

      expect(result.current.activeProfileId).toBe(DEFAULT_PROFILE_ID)
    })
  })

  describe('setActiveProfile', () => {
    it('changes the active profile', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      let profileId

      act(() => {
        profileId = result.current.createProfile('New Active')
        result.current.setActiveProfile(profileId)
      })

      expect(result.current.activeProfileId).toBe(profileId)
      expect(result.current.activeProfile.name).toBe('New Active')
    })

    it('persists active profile to localStorage', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      let profileId

      act(() => {
        profileId = result.current.createProfile('Persistent Active')
      })

      vi.clearAllMocks()

      act(() => {
        result.current.setActiveProfile(profileId)
      })

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('ignores invalid profile id', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })

      act(() => {
        result.current.setActiveProfile('non-existent-id')
      })

      expect(result.current.activeProfileId).toBe(DEFAULT_PROFILE_ID)
    })
  })

  describe('duplicateProfile', () => {
    it('creates a copy of a profile with new name', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      let originalId

      act(() => {
        originalId = result.current.createProfile('Original')
      })

      // Modify the original
      const original = result.current.profiles.find(p => p.id === originalId)
      act(() => {
        result.current.updateProfile({
          ...original,
          difficulties: original.difficulties.map(d =>
            d.id === 'hard' ? { ...d, minInterval: 1234 } : d
          )
        })
      })

      let copyId
      act(() => {
        copyId = result.current.duplicateProfile(originalId, 'Copy of Original')
      })

      const copy = result.current.profiles.find(p => p.id === copyId)
      expect(copy.name).toBe('Copy of Original')
      expect(copy.id).not.toBe(originalId)

      const hardDiff = copy.difficulties.find(d => d.id === 'hard')
      expect(hardDiff.minInterval).toBe(1234)
    })

    it('can duplicate default profile', () => {
      const { result } = renderHook(() => useProfiles(), { wrapper })
      let copyId

      act(() => {
        copyId = result.current.duplicateProfile(DEFAULT_PROFILE_ID, 'My Default Copy')
      })

      const copy = result.current.profiles.find(p => p.id === copyId)
      expect(copy.name).toBe('My Default Copy')
      expect(copy.isDefault).toBe(false)
      expect(copy.isReadOnly).toBe(false)
    })
  })

  describe('localStorage persistence', () => {
    it('loads profiles from localStorage on mount', () => {
      const savedProfiles = [{
        id: 'saved-profile',
        name: 'Saved Profile',
        isDefault: false,
        isReadOnly: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        difficulties: []
      }]
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'combat-reflex-profiles') {
          return JSON.stringify(savedProfiles)
        }
        return null
      })

      const { result } = renderHook(() => useProfiles(), { wrapper })

      const loaded = result.current.profiles.find(p => p.id === 'saved-profile')
      expect(loaded).toBeDefined()
    })

    it('loads active profile id from localStorage on mount', () => {
      const savedProfiles = [{
        id: 'my-profile',
        name: 'My Profile',
        isDefault: false,
        isReadOnly: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        difficulties: []
      }]
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'combat-reflex-profiles') {
          return JSON.stringify(savedProfiles)
        }
        if (key === 'combat-reflex-active-profile') {
          return 'my-profile'
        }
        return null
      })

      const { result } = renderHook(() => useProfiles(), { wrapper })
      expect(result.current.activeProfileId).toBe('my-profile')
    })

    it('falls back to default if saved active profile does not exist', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'combat-reflex-active-profile') {
          return 'deleted-profile-id'
        }
        return null
      })

      const { result } = renderHook(() => useProfiles(), { wrapper })
      expect(result.current.activeProfileId).toBe(DEFAULT_PROFILE_ID)
    })
  })
})
