import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFlashcards } from '../../../app/hooks/useFlashcards'

const lsMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((k: string) => store[k] ?? null),
    setItem: vi.fn((k: string, v: string) => {
      store[k] = v
    }),
    removeItem: vi.fn((k: string) => {
      delete store[k]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: lsMock })

describe('useFlashcards', () => {
  beforeEach(() => {
    lsMock.clear()
    vi.clearAllMocks()
  })

  it('starts empty', () => {
    const { result } = renderHook(() => useFlashcards())
    expect(result.current.flashcards).toHaveLength(0)
  })

  it('adds a flashcard', () => {
    const { result } = renderHook(() => useFlashcards())
    act(() => {
      result.current.addFlashcard('Γεια', 'Hello')
    })
    expect(result.current.flashcards).toHaveLength(1)
    expect(result.current.flashcards[0].greek).toBe('Γεια')
  })

  it('prevents duplicates', () => {
    const { result } = renderHook(() => useFlashcards())
    act(() => {
      result.current.addFlashcard('Γεια', 'Hello')
    })
    act(() => {
      result.current.addFlashcard('Γεια', 'Hello')
    })
    expect(result.current.flashcards).toHaveLength(1)
  })

  it('returns false for duplicate', () => {
    const { result } = renderHook(() => useFlashcards())
    let r1: boolean, r2: boolean
    act(() => {
      r1 = result.current.addFlashcard('Γεια', 'Hello')
    })
    act(() => {
      r2 = result.current.addFlashcard('Γεια', 'Hello')
    })
    expect(r1!).toBe(true)
    expect(r2!).toBe(false)
  })

  it('removes a flashcard', () => {
    const { result } = renderHook(() => useFlashcards())
    act(() => {
      result.current.addFlashcard('Γεια', 'Hello')
    })
    const id = result.current.flashcards[0].id
    act(() => {
      result.current.removeFlashcard(id)
    })
    expect(result.current.flashcards).toHaveLength(0)
  })

  it('marks reviewed and increments count', () => {
    const { result } = renderHook(() => useFlashcards())
    act(() => {
      result.current.addFlashcard('Γεια', 'Hello')
    })
    const id = result.current.flashcards[0].id
    act(() => {
      result.current.markReviewed(id)
    })
    expect(result.current.flashcards[0].reviewCount).toBe(1)
    expect(result.current.flashcards[0].lastReviewed).toBeDefined()
  })

  it('clears all flashcards', () => {
    const { result } = renderHook(() => useFlashcards())
    act(() => {
      result.current.addFlashcard('Γεια', 'Hello')
      result.current.addFlashcard('Ευχαριστώ', 'Thank you')
    })
    act(() => {
      result.current.clearAll()
    })
    expect(result.current.flashcards).toHaveLength(0)
  })

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useFlashcards())
    act(() => {
      result.current.addFlashcard('Γεια', 'Hello')
    })
    expect(lsMock.setItem).toHaveBeenCalled()
  })
})
