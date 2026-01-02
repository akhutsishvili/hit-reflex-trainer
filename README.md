# Combat Reflex

A mobile-first React web application for martial arts reaction training. Improve your reflexes by responding to randomized audio and visual cues for punches and kicks.

## Features

### Training Modes
- **Punches Only** - Focus on punch reactions
- **Kicks Only** - Focus on kick reactions
- **Both** - Mixed punches and kicks for realistic training

### Training Types
- **Single Hits** - Individual strikes with randomized intervals
- **Combo Series** - Multi-strike combinations with rest periods between combos

### Difficulty Levels
| Level | Interval Range | Hits/Session |
|-------|---------------|--------------|
| Very Easy | 2.5-4.0s | 18 |
| Easy | 1.5-2.5s | 30 |
| Normal | 1.0-1.8s | 45 |
| Hard | 0.6-1.2s | 68 |
| Very Hard | 0.3-0.8s | 92 |

### Custom Profiles
Create personalized training profiles with full control over:
- Number of hits per session (min/max range for randomization)
- Time intervals between hits
- Break duration between sessions (can be disabled)
- Combo settings (size, strike interval, rest periods)

### Additional Features
- **Multiple Sessions** - Chain 1-4 training sessions with automatic breaks
- **Progress Tracking** - Real-time progress bar and session statistics
- **Results Summary** - Completion rate, hits per minute, average pace
- **Dark Mode** - Automatic system-aware theme support
- **Screen Wake Lock** - Prevents screen from sleeping during training
- **Audio Cues** - Synthesized sound effects (no audio files required)
- **Offline Support** - Works without internet connection
- **Settings Persistence** - All preferences saved to localStorage

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **Web Audio API** - Synthesized audio feedback
- **Wake Lock API** - Screen sleep prevention
- **Vitest** - Testing framework

## Getting Started

### Prerequisites
- Node.js 18+ (recommend Node 22)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/akhutsishvili/hit-reflex-trainer.git
cd hit-reflex-trainer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## User Guide

### Quick Start
1. Open the app in your browser
2. Select your desired **Difficulty** level
3. Choose a **Training Mode** (Punches, Kicks, or Both)
4. Select **Training Type** (Single Hits or Combo Series)
5. Set the **Number of Sessions** (1-4)
6. Press **Start Training**

### During Training
- A 3-second countdown prepares you for the session
- Watch for visual cues (PUNCH in red, KICK in blue)
- Listen for audio cues (high tone = punch, low tone = kick)
- React as quickly as possible to each cue
- Progress bar shows your completion status
- Hold the **Stop** button for 1 second to end early

### Between Sessions
- Automatic 30-second break between sessions
- Warning sound plays at 5 seconds remaining
- Next session starts automatically

### Results Screen
After training completes, view your statistics:
- Total time
- Sessions completed
- Total hits and completion rate
- Hits per minute
- Average pace between hits

### Custom Profiles

1. Click the profile dropdown in the header
2. Select **Customize** to open the Profile Editor
3. Create a new profile or modify existing ones
4. Adjust settings for each difficulty level:
   - **Timing**: Min/max intervals between hits
   - **Hits**: Range for randomized hit count per session
   - **Rest**: Break duration between sessions (or disable)
   - **Combos**: Combo size, strike intervals, rest periods

Recommended value ranges are shown as hints. Values outside recommended ranges display a warning but are still allowed.

## Development

### Available Scripts

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run test     # Run tests in watch mode
npm run test:run # Run tests once
```

### Project Structure

```
src/
├── components/
│   ├── profiles/        # Profile management UI
│   │   ├── ProfileSelector.jsx
│   │   ├── ProfileEditor.jsx
│   │   ├── DifficultyEditor.jsx
│   │   ├── SettingInput.jsx
│   │   └── SettingToggle.jsx
│   ├── ConfigScreen.jsx     # Main settings screen
│   ├── TrainingScreen.jsx   # Active training display
│   ├── ResultsScreen.jsx    # Post-training statistics
│   ├── BreakScreen.jsx      # Between-session rest
│   ├── CountdownOverlay.jsx # Pre-training countdown
│   ├── ActionDisplay.jsx    # Punch/kick visual cue
│   └── ProgressBar.jsx      # Training progress indicator
├── context/
│   ├── TrainingContext.jsx  # Training state management
│   └── ProfileContext.jsx   # Profile CRUD & persistence
├── hooks/
│   ├── useAudio.js          # Web Audio API integration
│   └── useWakeLock.js       # Screen wake lock
├── utils/
│   ├── difficultyConfig.js  # Default difficulty settings
│   ├── profileUtils.js      # Profile helpers & validation
│   ├── statsCalculator.js   # Training statistics
│   └── audioSynthesizer.js  # Sound generation
├── App.jsx                  # Main orchestrator
└── main.jsx                 # Entry point
```

### Architecture

The app follows a state machine pattern for training phases:

```
IDLE → COUNTDOWN → TRAINING → BREAK → (repeat) → COMPLETE
```

- **TrainingContext** manages global training state
- **ProfileContext** handles profile CRUD and localStorage persistence
- **App.jsx** orchestrates phase transitions and timer scheduling
- Screen components render based on current phase

### Testing

Tests are written with Vitest and React Testing Library:

```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm run test

# Run specific test file
npm run test -- src/utils/profileUtils.test.js
```

## Browser Support

- Chrome/Edge 84+ (recommended)
- Firefox 79+
- Safari 14.1+

**Note:** Wake Lock API requires HTTPS in production and may not be available in all browsers.

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
