/**
 * Audio Synthesizer for Combat Reflex Training App
 *
 * Uses Web Audio API to generate distinct sounds for training cues.
 * All sounds are synthesized in real-time using oscillators - no external files needed.
 */

/**
 * Creates a gain envelope for smooth attack and decay
 * @param {AudioContext} audioContext - The Web Audio API context
 * @param {number} attackTime - Time in seconds for the attack phase
 * @param {number} decayTime - Time in seconds for the decay phase
 * @param {number} startTime - When to start the envelope
 * @returns {GainNode} Configured gain node with envelope
 */
function createEnvelope(audioContext, attackTime, decayTime, startTime) {
  const gainNode = audioContext.createGain();

  // Start at zero volume
  gainNode.gain.setValueAtTime(0, startTime);

  // Attack: ramp up to full volume
  gainNode.gain.linearRampToValueAtTime(1, startTime + attackTime);

  // Decay: ramp down to zero
  gainNode.gain.linearRampToValueAtTime(0, startTime + attackTime + decayTime);

  return gainNode;
}

/**
 * Creates and plays a single tone
 * @param {AudioContext} audioContext - The Web Audio API context
 * @param {Object} options - Tone configuration
 * @param {string} options.type - Oscillator type ('sine', 'square', 'sawtooth', 'triangle')
 * @param {number} options.frequency - Frequency in Hz
 * @param {number} options.duration - Total duration in seconds
 * @param {number} options.attack - Attack time in seconds
 * @param {number} options.decay - Decay time in seconds
 * @param {number} [options.startTime] - When to start (defaults to now)
 * @param {number} [options.endFrequency] - End frequency for sweeps (optional)
 * @param {number} [options.volume] - Volume multiplier (0-1, defaults to 0.5)
 */
function playTone(audioContext, options) {
  const {
    type,
    frequency,
    duration,
    attack,
    decay,
    startTime = audioContext.currentTime,
    endFrequency = null,
    volume = 0.5
  } = options;

  // Create oscillator
  const oscillator = audioContext.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  // If end frequency is specified, create a frequency sweep
  if (endFrequency !== null) {
    oscillator.frequency.linearRampToValueAtTime(endFrequency, startTime + duration);
  }

  // Create envelope for smooth sound
  const envelope = createEnvelope(audioContext, attack, decay, startTime);

  // Create a volume control node
  const volumeNode = audioContext.createGain();
  volumeNode.gain.setValueAtTime(volume, startTime);

  // Connect the audio graph: oscillator -> envelope -> volume -> output
  oscillator.connect(envelope);
  envelope.connect(volumeNode);
  volumeNode.connect(audioContext.destination);

  // Start and stop the oscillator
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);

  return oscillator;
}

/**
 * Punch Sound
 * Quick, sharp attack sound using square wave for that "impact" feel
 * - Type: Square wave (harsh, punchy)
 * - Frequency: 800Hz (mid-high, cutting through)
 * - Duration: 100ms (quick)
 * - Attack: 10ms, Decay: 90ms
 */
export function playPunchSound(audioContext) {
  if (!audioContext) return;

  playTone(audioContext, {
    type: 'square',
    frequency: 800,
    duration: 0.1,      // 100ms
    attack: 0.01,       // 10ms
    decay: 0.09,        // 90ms
    volume: 0.4         // Slightly lower volume for square wave harshness
  });
}

/**
 * Kick Sound
 * Deeper, more resonant sound using sine wave
 * - Type: Sine wave (smooth, deep)
 * - Frequency: 400Hz (lower, more body)
 * - Duration: 200ms (longer for impact feel)
 * - Attack: 20ms, Decay: 180ms
 */
export function playKickSound(audioContext) {
  if (!audioContext) return;

  playTone(audioContext, {
    type: 'sine',
    frequency: 400,
    duration: 0.2,      // 200ms
    attack: 0.02,       // 20ms
    decay: 0.18,        // 180ms
    volume: 0.6         // Slightly higher for sine wave
  });
}

/**
 * Session Start Sound
 * Ascending two-tone signal indicating session beginning
 * - Two rising tones: 400Hz -> 600Hz
 * - Duration: 150ms each
 * - Gap: 50ms between tones
 */
export function playSessionStartSound(audioContext) {
  if (!audioContext) return;

  const now = audioContext.currentTime;

  // First tone: 400Hz rising to 500Hz
  playTone(audioContext, {
    type: 'sine',
    frequency: 400,
    endFrequency: 500,
    duration: 0.15,     // 150ms
    attack: 0.02,
    decay: 0.13,
    startTime: now,
    volume: 0.5
  });

  // Second tone: 500Hz rising to 600Hz (after 200ms = 150ms + 50ms gap)
  playTone(audioContext, {
    type: 'sine',
    frequency: 500,
    endFrequency: 600,
    duration: 0.15,     // 150ms
    attack: 0.02,
    decay: 0.13,
    startTime: now + 0.2,
    volume: 0.5
  });
}

/**
 * Session End Sound
 * Descending two-tone signal indicating session completion
 * - Two falling tones: 600Hz -> 400Hz
 * - Duration: 150ms each
 * - Gap: 50ms between tones
 */
export function playSessionEndSound(audioContext) {
  if (!audioContext) return;

  const now = audioContext.currentTime;

  // First tone: 600Hz falling to 500Hz
  playTone(audioContext, {
    type: 'sine',
    frequency: 600,
    endFrequency: 500,
    duration: 0.15,     // 150ms
    attack: 0.02,
    decay: 0.13,
    startTime: now,
    volume: 0.5
  });

  // Second tone: 500Hz falling to 400Hz (after 200ms = 150ms + 50ms gap)
  playTone(audioContext, {
    type: 'sine',
    frequency: 500,
    endFrequency: 400,
    duration: 0.15,     // 150ms
    attack: 0.02,
    decay: 0.13,
    startTime: now + 0.2,
    volume: 0.5
  });
}

/**
 * 5-Second Warning Sound
 * Three quick beeps to alert user of approaching end
 * - Three beeps at 500Hz
 * - Duration: 80ms each
 * - Gap: 100ms between beeps
 */
export function playWarningSound(audioContext) {
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const beepDuration = 0.08;  // 80ms
  const gapDuration = 0.1;    // 100ms
  const totalCycle = beepDuration + gapDuration;  // 180ms per beep cycle

  // Play three beeps
  for (let i = 0; i < 3; i++) {
    playTone(audioContext, {
      type: 'sine',
      frequency: 500,
      duration: beepDuration,
      attack: 0.01,
      decay: 0.07,
      startTime: now + (i * totalCycle),
      volume: 0.5
    });
  }
}

/**
 * Countdown Tick Sound
 * Short beep for countdown (3, 2, 1)
 * - Type: Triangle wave (softer than square, clearer than sine)
 * - Frequency: 600Hz
 * - Duration: 100ms
 */
export function playCountdownSound(audioContext) {
  if (!audioContext) return;

  playTone(audioContext, {
    type: 'triangle',
    frequency: 600,
    duration: 0.1,      // 100ms
    attack: 0.01,       // 10ms
    decay: 0.09,        // 90ms
    volume: 0.5
  });
}

/**
 * Creates a new AudioContext
 * Should be called on user interaction to comply with browser autoplay policies
 * @returns {AudioContext} New audio context
 */
export function createAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  return new AudioContextClass();
}

/**
 * Resumes a suspended AudioContext
 * Required by browsers after user interaction
 * @param {AudioContext} audioContext - The context to resume
 * @returns {Promise} Resolves when context is resumed
 */
export async function resumeAudioContext(audioContext) {
  if (audioContext && audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  return audioContext;
}
