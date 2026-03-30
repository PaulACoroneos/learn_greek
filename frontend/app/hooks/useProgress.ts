import { useState, useEffect, useCallback } from 'react'

export interface WordStat {
  greek: string
  english: string
  correct: number
  incorrect: number
  lastSeen: string
}

export interface ProgressData {
  totalAnswered: number
  totalCorrect: number
  currentLevel: number // 1–6 maps to A1–C2
  consecutiveCorrect: number
  consecutiveIncorrect: number
  wordStats: Record<string, WordStat>
}

const STORAGE_KEY = 'learn-greek-progress'

const DEFAULT: ProgressData = {
  totalAnswered: 0,
  totalCorrect: 0,
  currentLevel: 1,
  consecutiveCorrect: 0,
  consecutiveIncorrect: 0,
  wordStats: {},
}

function load(): ProgressData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...DEFAULT, ...(JSON.parse(stored) as ProgressData) } : DEFAULT
  } catch {
    return DEFAULT
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(DEFAULT)

  // Load after mount (SSR-safe)
  useEffect(() => {
    setProgress(load())
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const recordAnswer = useCallback(
    (correct: boolean, words: { greek: string; english: string }[]) => {
      setProgress((prev) => {
        const newWordStats = { ...prev.wordStats }
        for (const w of words) {
          const existing = newWordStats[w.greek] ?? {
            greek: w.greek,
            english: w.english,
            correct: 0,
            incorrect: 0,
            lastSeen: '',
          }
          newWordStats[w.greek] = {
            ...existing,
            correct: existing.correct + (correct ? 1 : 0),
            incorrect: existing.incorrect + (correct ? 0 : 1),
            lastSeen: new Date().toISOString(),
          }
        }

        const newConsecCorrect = correct ? prev.consecutiveCorrect + 1 : 0
        const newConsecIncorrect = correct ? 0 : prev.consecutiveIncorrect + 1

        let newLevel = prev.currentLevel
        const leveledUp = newConsecCorrect >= 3 && newLevel < 6
        const leveledDown = newConsecIncorrect >= 2 && newLevel > 1
        if (leveledUp) newLevel += 1
        else if (leveledDown) newLevel -= 1

        return {
          ...prev,
          totalAnswered: prev.totalAnswered + 1,
          totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
          consecutiveCorrect: leveledUp ? 0 : newConsecCorrect,
          consecutiveIncorrect: leveledDown ? 0 : newConsecIncorrect,
          currentLevel: newLevel,
          wordStats: newWordStats,
        }
      })
    },
    []
  )

  const resetProgress = useCallback(() => setProgress(DEFAULT), [])

  return { progress, recordAnswer, resetProgress }
}
