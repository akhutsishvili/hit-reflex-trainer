/**
 * ProfileContext - Manages training profiles for Combat Reflex
 *
 * Provides profile CRUD operations, localStorage persistence,
 * and settings resolution for the training system.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  createDefaultProfile,
  createNewProfile,
  mergeWithDefaults,
  generateUUID,
  DEFAULT_PROFILE_ID
} from '../utils/profileUtils'

const ProfileContext = createContext(null)

const STORAGE_KEY_PROFILES = 'combat-reflex-profiles'
const STORAGE_KEY_ACTIVE = 'combat-reflex-active-profile'

/**
 * ProfileProvider - Wraps the app and provides profile management
 */
export function ProfileProvider({ children }) {
  // Initialize with default profile
  const [profiles, setProfiles] = useState(() => {
    const defaultProfile = createDefaultProfile()
    const saved = localStorage.getItem(STORAGE_KEY_PROFILES)

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Merge saved profiles with defaults to ensure valid structure
        const customProfiles = parsed.map(p => mergeWithDefaults(p))
        return [defaultProfile, ...customProfiles]
      } catch (e) {
        console.warn('Failed to parse saved profiles:', e)
      }
    }

    return [defaultProfile]
  })

  // Initialize active profile ID
  const [activeProfileId, setActiveProfileIdState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE)
    return saved || DEFAULT_PROFILE_ID
  })

  // Persist profiles to localStorage when they change
  useEffect(() => {
    const customProfiles = profiles.filter(p => !p.isDefault)
    if (customProfiles.length > 0) {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(customProfiles))
    } else {
      localStorage.removeItem(STORAGE_KEY_PROFILES)
    }
  }, [profiles])

  // Persist active profile ID when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE, activeProfileId)
  }, [activeProfileId])

  // Validate active profile ID exists (only on mount)
  useEffect(() => {
    const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE)
    if (savedActive && savedActive !== DEFAULT_PROFILE_ID) {
      const exists = profiles.some(p => p.id === savedActive)
      if (!exists) {
        setActiveProfileIdState(DEFAULT_PROFILE_ID)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Get the active profile object
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles.find(p => p.isDefault)

  /**
   * Get effective difficulty settings from active profile
   */
  const getEffectiveSettings = useCallback((difficultyId) => {
    if (!activeProfile) return undefined
    return activeProfile.difficulties.find(d => d.id === difficultyId)
  }, [activeProfile])

  /**
   * Get effective combo settings from active profile
   */
  const getEffectiveComboSettings = useCallback((difficultyId) => {
    const settings = getEffectiveSettings(difficultyId)
    if (!settings) return undefined
    return settings.combo
  }, [getEffectiveSettings])

  /**
   * Create a new profile
   */
  const createProfile = useCallback((name) => {
    const newProfile = createNewProfile(name)
    setProfiles(prev => [...prev, newProfile])
    return newProfile.id
  }, [])

  /**
   * Update an existing profile
   */
  const updateProfile = useCallback((updatedProfile) => {
    // Cannot update default profile
    if (updatedProfile.id === DEFAULT_PROFILE_ID) return

    setProfiles(prev => prev.map(p => {
      if (p.id === updatedProfile.id && !p.isReadOnly) {
        return {
          ...updatedProfile,
          updatedAt: Date.now()
        }
      }
      return p
    }))
  }, [])

  /**
   * Delete a profile
   */
  const deleteProfile = useCallback((profileId) => {
    // Cannot delete default profile
    if (profileId === DEFAULT_PROFILE_ID) return

    setProfiles(prev => prev.filter(p => p.id !== profileId))

    // If deleted the active profile, switch to default
    if (activeProfileId === profileId) {
      setActiveProfileIdState(DEFAULT_PROFILE_ID)
    }
  }, [activeProfileId])

  /**
   * Set the active profile
   * Note: Uses functional update to validate against current profiles state
   */
  const setActiveProfile = useCallback((profileId) => {
    setProfiles(currentProfiles => {
      const exists = currentProfiles.some(p => p.id === profileId)
      if (exists) {
        setActiveProfileIdState(profileId)
      }
      return currentProfiles // Return unchanged
    })
  }, [])

  /**
   * Duplicate a profile
   */
  const duplicateProfile = useCallback((sourceId, newName) => {
    const source = profiles.find(p => p.id === sourceId)
    if (!source) return null

    const now = Date.now()
    const newProfile = {
      ...source,
      id: generateUUID(),
      name: newName,
      isDefault: false,
      isReadOnly: false,
      createdAt: now,
      updatedAt: now,
      difficulties: source.difficulties.map(d => ({
        ...d,
        totalHits: { ...d.totalHits },
        combo: {
          ...d.combo,
          comboSize: { ...d.combo.comboSize },
          strikeInterval: { ...d.combo.strikeInterval },
          restBetweenCombos: { ...d.combo.restBetweenCombos }
        },
        rest: { ...d.rest }
      }))
    }

    setProfiles(prev => [...prev, newProfile])
    return newProfile.id
  }, [profiles])

  const value = {
    profiles,
    activeProfileId,
    activeProfile,
    getEffectiveSettings,
    getEffectiveComboSettings,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    duplicateProfile
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

/**
 * Hook to access profile context
 */
export function useProfiles() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider')
  }
  return context
}

export default ProfileContext
