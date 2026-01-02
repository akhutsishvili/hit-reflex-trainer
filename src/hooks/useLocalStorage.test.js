import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage, removeFromStorage, clearStorageByPrefix } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('returns stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('stored-value')
  })

  it('updates state and localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new-value')
    })

    expect(result.current[0]).toBe('new-value')
    expect(JSON.parse(localStorage.getItem('test-key'))).toBe('new-value')
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0))

    act(() => {
      result.current[1](prev => prev + 1)
    })

    expect(result.current[0]).toBe(1)
  })

  it('handles object values', () => {
    const initial = { name: 'test', value: 42 }
    const { result } = renderHook(() => useLocalStorage('object-key', initial))

    expect(result.current[0]).toEqual(initial)

    act(() => {
      result.current[1]({ name: 'updated', value: 100 })
    })

    expect(result.current[0]).toEqual({ name: 'updated', value: 100 })
  })

  it('handles array values', () => {
    const { result } = renderHook(() => useLocalStorage('array-key', [1, 2, 3]))

    act(() => {
      result.current[1](prev => [...prev, 4])
    })

    expect(result.current[0]).toEqual([1, 2, 3, 4])
  })
})

describe('removeFromStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('removes item from localStorage', () => {
    localStorage.setItem('to-remove', 'value')
    expect(localStorage.getItem('to-remove')).toBe('value')

    removeFromStorage('to-remove')
    expect(localStorage.getItem('to-remove')).toBeNull()
  })

  it('handles non-existent keys gracefully', () => {
    expect(() => removeFromStorage('non-existent')).not.toThrow()
  })
})

describe('clearStorageByPrefix', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('removes all items with matching prefix', () => {
    localStorage.setItem('combat-reflex-setting1', 'value1')
    localStorage.setItem('combat-reflex-setting2', 'value2')
    localStorage.setItem('other-key', 'value3')

    clearStorageByPrefix('combat-reflex')

    expect(localStorage.getItem('combat-reflex-setting1')).toBeNull()
    expect(localStorage.getItem('combat-reflex-setting2')).toBeNull()
    expect(localStorage.getItem('other-key')).toBe('value3')
  })

  it('uses default prefix when none provided', () => {
    localStorage.setItem('combat-reflex-test', 'value')

    clearStorageByPrefix()

    expect(localStorage.getItem('combat-reflex-test')).toBeNull()
  })
})
