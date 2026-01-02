import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWakeLock } from './useWakeLock'

describe('useWakeLock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns isSupported as true when Wake Lock API is available', () => {
    const { result } = renderHook(() => useWakeLock())
    expect(result.current.isSupported).toBe(true)
  })

  it('starts with isLocked as false', () => {
    const { result } = renderHook(() => useWakeLock())
    expect(result.current.isLocked).toBe(false)
  })

  it('sets isLocked to true after requestWakeLock', async () => {
    const { result } = renderHook(() => useWakeLock())

    await act(async () => {
      await result.current.requestWakeLock()
    })

    expect(result.current.isLocked).toBe(true)
  })

  it('sets isLocked to false after releaseWakeLock', async () => {
    const { result } = renderHook(() => useWakeLock())

    await act(async () => {
      await result.current.requestWakeLock()
    })

    expect(result.current.isLocked).toBe(true)

    await act(async () => {
      await result.current.releaseWakeLock()
    })

    expect(result.current.isLocked).toBe(false)
  })

  it('returns all expected properties', () => {
    const { result } = renderHook(() => useWakeLock())

    expect(result.current).toHaveProperty('isLocked')
    expect(result.current).toHaveProperty('isSupported')
    expect(result.current).toHaveProperty('requestWakeLock')
    expect(result.current).toHaveProperty('releaseWakeLock')
    expect(typeof result.current.requestWakeLock).toBe('function')
    expect(typeof result.current.releaseWakeLock).toBe('function')
  })

  it('handles multiple request calls gracefully', async () => {
    const { result } = renderHook(() => useWakeLock())

    await act(async () => {
      await result.current.requestWakeLock()
      await result.current.requestWakeLock()
    })

    expect(result.current.isLocked).toBe(true)
  })

  it('handles release when not locked', async () => {
    const { result } = renderHook(() => useWakeLock())

    // Should not throw
    await act(async () => {
      await result.current.releaseWakeLock()
    })

    expect(result.current.isLocked).toBe(false)
  })
})
