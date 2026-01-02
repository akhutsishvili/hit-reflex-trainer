# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Combat Reflex** - A mobile-first React web app for martial arts reaction training. Users respond to audio/visual cues for punches and kicks across configurable difficulty levels and sessions.

## Commands

```bash
npm run dev      # Start dev server at localhost:5173
npm run build    # Production build to dist/
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

**Note:** Requires Node 18+. Use `nvm use 22` if needed.

## Architecture

### State Flow
```
TrainingContext (global state)
        ↓
    App.jsx (orchestrator - manages phase transitions, timers, audio triggers)
        ↓
    Screen Components (render based on phase)
```

### Training Phase State Machine
```
IDLE → COUNTDOWN → TRAINING → [MID_REST →] SESSION_END → BREAK → (repeat) → COMPLETE
```

### Key Integration Points

**App.jsx** (`src/App.jsx`) - Central orchestrator that:
- Manages training phase transitions via `useEffect` hooks
- Schedules randomized action intervals based on difficulty
- Triggers audio (useAudio) and wake lock (useWakeLock) at appropriate times
- Passes `currentAction` prop to TrainingScreen

**TrainingContext** (`src/context/TrainingContext.jsx`) - Global state for:
- Training config (mode, difficulty, sessions)
- Current phase and session tracking
- Session history (persisted to localStorage)

**Audio System** (`src/utils/audioSynthesizer.js` + `src/hooks/useAudio.js`):
- Web Audio API synthesized tones (no audio files)
- 5 distinct sounds: punch (800Hz), kick (400Hz), session start/end, warning

### Configuration

**Difficulty levels** defined in `src/utils/difficultyConfig.js`:
- Very Easy to Very Hard with varying interval ranges and hit counts
- `getRandomInterval(difficulty)` generates randomized timing

## Tech Stack

- React 18 + Vite
- Tailwind CSS v4 with system-aware dark mode (`dark:` classes)
- Web Audio API for synthesized sounds
- Wake Lock API to prevent screen sleep
- localStorage for settings persistence
