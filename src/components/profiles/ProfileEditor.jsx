/**
 * ProfileEditor - Full-screen modal for editing profile settings
 */

import { useState, useEffect } from 'react'
import { useProfiles } from '../../context/ProfileContext'
import { createDefaultProfile, validateProfile } from '../../utils/profileUtils'
import DifficultyEditor from './DifficultyEditor'

function ProfileEditor({ isOpen, onClose }) {
  const {
    activeProfile,
    activeProfileId,
    updateProfile,
    createProfile,
    setActiveProfile,
    duplicateProfile
  } = useProfiles()

  const [editingProfile, setEditingProfile] = useState(null)
  const [errors, setErrors] = useState([])
  const [warnings, setWarnings] = useState([])
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize editing state when modal opens
  useEffect(() => {
    if (isOpen && activeProfile) {
      // Deep clone the profile for editing
      setEditingProfile(JSON.parse(JSON.stringify(activeProfile)))
      setHasChanges(false)
      setErrors([])
      setWarnings([])
    }
  }, [isOpen, activeProfile])

  if (!isOpen || !editingProfile) return null

  const isReadOnly = editingProfile.isReadOnly

  const handleNameChange = (e) => {
    setEditingProfile({ ...editingProfile, name: e.target.value })
    setHasChanges(true)
  }

  const handleDifficultyChange = (index, updatedDifficulty) => {
    const newDifficulties = [...editingProfile.difficulties]
    newDifficulties[index] = updatedDifficulty
    setEditingProfile({ ...editingProfile, difficulties: newDifficulties })
    setHasChanges(true)
  }

  const handleResetDifficulty = (index) => {
    const defaultProfile = createDefaultProfile()
    const newDifficulties = [...editingProfile.difficulties]
    newDifficulties[index] = JSON.parse(JSON.stringify(defaultProfile.difficulties[index]))
    setEditingProfile({ ...editingProfile, difficulties: newDifficulties })
    setHasChanges(true)
  }

  const handleResetAll = () => {
    if (confirm('Reset all settings to defaults?')) {
      const defaultProfile = createDefaultProfile()
      setEditingProfile({
        ...editingProfile,
        difficulties: JSON.parse(JSON.stringify(defaultProfile.difficulties))
      })
      setHasChanges(true)
    }
  }

  const handleSave = () => {
    const validation = validateProfile(editingProfile)

    if (validation.errors.length > 0) {
      setErrors(validation.errors)
      return
    }

    setWarnings(validation.warnings)

    // If there are warnings but no errors, still allow save
    updateProfile(editingProfile)
    onClose()
  }

  const handleDuplicate = () => {
    const newName = prompt('Enter name for the duplicate profile:', `${editingProfile.name} (Copy)`)
    if (newName) {
      const newId = duplicateProfile(editingProfile.id, newName)
      if (newId) {
        setActiveProfile(newId)
        onClose()
      }
    }
  }

  const handleCreateEditable = () => {
    // Create a new editable copy of the default profile
    const newId = createProfile(`My ${activeProfile.name}`)
    setActiveProfile(newId)
    // The effect will update editingProfile when activeProfile changes
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('Discard unsaved changes?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-gray-900 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>

          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="
                  px-4 py-2 rounded-lg
                  bg-purple-600 text-white
                  hover:bg-purple-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors font-medium
                "
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Read-only notice */}
          {isReadOnly && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-300">
                    Default profile is read-only
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    Create a custom profile to modify settings.
                  </p>
                  <button
                    onClick={handleCreateEditable}
                    className="
                      mt-3 px-4 py-2 rounded-lg
                      bg-amber-600 text-white
                      hover:bg-amber-700
                      transition-colors text-sm font-medium
                    "
                  >
                    Create Editable Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="font-medium text-red-700 dark:text-red-300 mb-2">
                Please fix the following errors:
              </p>
              <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 space-y-1">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Profile Name */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Name
            </label>
            <input
              type="text"
              value={editingProfile.name}
              onChange={handleNameChange}
              disabled={isReadOnly}
              className="
                w-full px-4 py-3 rounded-lg
                border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-purple-500
                disabled:opacity-50 disabled:cursor-not-allowed
                text-lg
              "
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {!isReadOnly && (
              <button
                onClick={handleResetAll}
                className="
                  px-4 py-2 rounded-lg
                  bg-gray-200 dark:bg-gray-700
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-300 dark:hover:bg-gray-600
                  transition-colors text-sm
                "
              >
                Reset All to Defaults
              </button>
            )}
            <button
              onClick={handleDuplicate}
              className="
                px-4 py-2 rounded-lg
                bg-gray-200 dark:bg-gray-700
                text-gray-700 dark:text-gray-300
                hover:bg-gray-300 dark:hover:bg-gray-600
                transition-colors text-sm
              "
            >
              Duplicate Profile
            </button>
          </div>

          {/* Difficulty Editors */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Difficulty Settings
            </h2>
            {editingProfile.difficulties.map((difficulty, index) => (
              <DifficultyEditor
                key={difficulty.id}
                difficulty={difficulty}
                onChange={(updated) => handleDifficultyChange(index, updated)}
                onReset={() => handleResetDifficulty(index)}
                isReadOnly={isReadOnly}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer for mobile */}
      {!isReadOnly && hasChanges && (
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sm:hidden">
          <button
            onClick={handleSave}
            className="
              w-full py-4 rounded-xl
              bg-purple-600 text-white
              hover:bg-purple-700
              transition-colors font-semibold text-lg
            "
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileEditor
