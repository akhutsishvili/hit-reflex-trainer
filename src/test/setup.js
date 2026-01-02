import '@testing-library/jest-dom'

// Mock Web Audio API
class MockAudioContext {
  constructor() {
    this.state = 'running'
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
    }
  }
  createGain() {
    return {
      gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
      connect: () => {},
    }
  }
  resume() {
    return Promise.resolve()
  }
  close() {
    return Promise.resolve()
  }
  get currentTime() {
    return 0
  }
  get destination() {
    return {}
  }
}

globalThis.AudioContext = MockAudioContext
globalThis.webkitAudioContext = MockAudioContext

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null
  },
  setItem(key, value) {
    this.store[key] = String(value)
  },
  removeItem(key) {
    delete this.store[key]
  },
  clear() {
    this.store = {}
  },
  get length() {
    return Object.keys(this.store).length
  },
  key(index) {
    return Object.keys(this.store)[index] || null
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
})

// Mock navigator.wakeLock
Object.defineProperty(globalThis.navigator, 'wakeLock', {
  value: {
    request: () => Promise.resolve({
      released: false,
      release: () => Promise.resolve(),
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  },
  writable: true,
})
