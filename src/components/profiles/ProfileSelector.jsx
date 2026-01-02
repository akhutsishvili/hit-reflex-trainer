/**
 * ProfileSelector - Dropdown for selecting and managing training profiles
 */

import { useState } from 'react'
import { useProfiles } from '../../context/ProfileContext'

function ProfileSelector({ onCustomize }) {
  const {
    profiles,
    activeProfileId,
    activeProfile,
    setActiveProfile,
    createProfile,
    deleteProfile
  } = useProfiles()

  const [isOpen, setIsOpen] = useState(false)
  const [showNewProfileInput, setShowNewProfileInput] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')

  const handleProfileSelect = (profileId) => {
    setActiveProfile(profileId)
    setIsOpen(false)
  }

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      const newId = createProfile(newProfileName.trim())
      setActiveProfile(newId)
      setNewProfileName('')
      setShowNewProfileInput(false)
      setIsOpen(false)
    }
  }

  const handleDeleteProfile = (e, profileId) => {
    e.stopPropagation()
    if (confirm('Delete this profile?')) {
      deleteProfile(profileId)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Profile:</span>

        {/* Profile dropdown button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="
            flex items-center gap-2 px-3 py-2 rounded-lg
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            text-gray-700 dark:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-700
            transition-colors
          "
        >
          <span className="font-medium">{activeProfile?.name || 'Default'}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Customize button */}
        <button
          onClick={onCustomize}
          className="
            p-2 rounded-lg
            bg-purple-100 dark:bg-purple-900/30
            text-purple-600 dark:text-purple-400
            hover:bg-purple-200 dark:hover:bg-purple-900/50
            transition-colors
          "
          title="Customize settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="
            absolute top-full left-0 mt-2 z-20
            min-w-[200px] py-2
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-lg
          ">
            {/* Profile list */}
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileSelect(profile.id)}
                className={`
                  w-full px-4 py-2 text-left
                  flex items-center justify-between gap-2
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors
                  ${profile.id === activeProfileId
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {profile.isDefault && (
                    <span className="text-xs text-gray-400">(default)</span>
                  )}
                  <span>{profile.name}</span>
                </span>

                {/* Delete button for custom profiles */}
                {!profile.isDefault && (
                  <button
                    onClick={(e) => handleDeleteProfile(e, profile.id)}
                    className="
                      p-1 rounded
                      text-gray-400 hover:text-red-500
                      hover:bg-red-50 dark:hover:bg-red-900/20
                      transition-colors
                    "
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </button>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

            {/* New profile input or button */}
            {showNewProfileInput ? (
              <div className="px-4 py-2">
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Profile name..."
                  className="
                    w-full px-3 py-2 rounded-lg
                    border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-700
                    text-gray-900 dark:text-white
                    placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-purple-500
                  "
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateProfile()
                    if (e.key === 'Escape') {
                      setShowNewProfileInput(false)
                      setNewProfileName('')
                    }
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleCreateProfile}
                    disabled={!newProfileName.trim()}
                    className="
                      flex-1 px-3 py-1.5 rounded-lg
                      bg-purple-600 text-white
                      hover:bg-purple-700
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors text-sm
                    "
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowNewProfileInput(false)
                      setNewProfileName('')
                    }}
                    className="
                      px-3 py-1.5 rounded-lg
                      bg-gray-200 dark:bg-gray-700
                      text-gray-700 dark:text-gray-300
                      hover:bg-gray-300 dark:hover:bg-gray-600
                      transition-colors text-sm
                    "
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewProfileInput(true)}
                className="
                  w-full px-4 py-2 text-left
                  text-purple-600 dark:text-purple-400
                  hover:bg-purple-50 dark:hover:bg-purple-900/20
                  transition-colors
                  flex items-center gap-2
                "
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Profile</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ProfileSelector
