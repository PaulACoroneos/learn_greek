import { useState, useEffect, useCallback } from 'react'
import type { Flashcard } from '../types'

const STORAGE_KEY = 'learn-greek-flashcards'

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as Flashcard[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards))
  }, [flashcards])

  const addFlashcard = useCallback(
    (greek: string, english: string, transliteration?: string, example?: string): boolean => {
      if (flashcards.some((fc) => fc.greek === greek)) return false
      const newCard: Flashcard = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        greek,
        english,
        transliteration,
        example,
        addedAt: new Date().toISOString(),
        reviewCount: 0,
      }
      setFlashcards((prev) => [...prev, newCard])
      return true
    },
    [flashcards]
  )

  const removeFlashcard = useCallback((id: string) => {
    setFlashcards((prev) => prev.filter((fc) => fc.id !== id))
  }, [])

  const markReviewed = useCallback((id: string) => {
    setFlashcards((prev) =>
      prev.map((fc) =>
        fc.id === id
          ? { ...fc, reviewCount: fc.reviewCount + 1, lastReviewed: new Date().toISOString() }
          : fc
      )
    )
  }, [])

  const clearAll = useCallback(() => setFlashcards([]), [])

  return { flashcards, addFlashcard, removeFlashcard, markReviewed, clearAll }
}
