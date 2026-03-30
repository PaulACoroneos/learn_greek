import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import WordBubbles from '../components/WordBubbles/WordBubbles'
import FreeTyping from '../components/FreeTyping/FreeTyping'
import { useFlashcards } from '../hooks/useFlashcards'
import { useProgress } from '../hooks/useProgress'
import { generateWordBubbleExercise, type ExerciseData } from '../server-fns/practice'
import { LEVEL_INFO } from '../lib/levels'

export const Route = createFileRoute('/practice')({
  component: PracticePage,
})

type Mode = 'word-bubbles' | 'free-typing'

const FT_EXERCISES = [
  {
    id: 'ft1',
    prompt: 'Hello',
    promptTranslation: 'Type the Greek translation',
    expectedAnswer: 'Γεια',
    hint: 'Starts with Γ',
    missing: [{ greek: 'Γεια', english: 'Hello' }],
  },
  {
    id: 'ft2',
    prompt: 'Thank you',
    promptTranslation: 'Type the Greek translation',
    expectedAnswer: 'Ευχαριστώ',
    hint: '9 letters, starts with Ε',
    missing: [{ greek: 'Ευχαριστώ', english: 'Thank you' }],
  },
  {
    id: 'ft3',
    prompt: 'Good night',
    promptTranslation: 'Type the Greek for "Good night"',
    expectedAnswer: 'Καληνύχτα',
    hint: 'Starts with Καλη…',
    missing: [{ greek: 'Καληνύχτα', english: 'Good night' }],
  },
]

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function PracticePage() {
  const [mode, setMode] = useState<Mode>('word-bubbles')

  // Word bubbles adaptive state
  const [exercise, setExercise] = useState<ExerciseData | null>(null)
  const [shuffledOptions, setShuffledOptions] = useState<
    { id: string; greek: string; english: string }[]
  >([])
  const [exerciseKey, setExerciseKey] = useState(0)
  const [loadingEx, setLoadingEx] = useState(false)
  const [exError, setExError] = useState<string | null>(null)
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 })
  const [recentlyMissed, setRecentlyMissed] = useState<string[]>([])

  // Level-change toast
  const [levelToast, setLevelToast] = useState<'up' | 'down' | null>(null)
  const prevLevelRef = useRef<number | null>(null)

  // Free typing state
  const [ftIdx, setFtIdx] = useState(0)
  const [ftScore, setFtScore] = useState({ correct: 0, total: 0 })

  const { addFlashcard } = useFlashcards()
  const { progress, recordAnswer } = useProgress()

  const levelInfo = LEVEL_INFO[progress.currentLevel]

  // Detect level changes and show toast
  useEffect(() => {
    if (prevLevelRef.current === null) {
      prevLevelRef.current = progress.currentLevel
      return
    }
    if (prevLevelRef.current !== progress.currentLevel) {
      setLevelToast(progress.currentLevel > prevLevelRef.current ? 'up' : 'down')
      prevLevelRef.current = progress.currentLevel
      const t = setTimeout(() => setLevelToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [progress.currentLevel])

  async function loadExercise(level: number, missed: string[]) {
    setLoadingEx(true)
    setExError(null)
    try {
      const ex = await generateWordBubbleExercise({
        data: { level, recentlyMissed: missed.slice(0, 5) },
      })
      const options = shuffle([
        ...ex.correctWords.map((w, i) => ({ id: `c${i}`, ...w })),
        ...ex.distractors.map((w, i) => ({ id: `d${i}`, ...w })),
      ])
      setExercise(ex)
      setShuffledOptions(options)
      setExerciseKey((k) => k + 1)
    } catch (e) {
      setExError(e instanceof Error ? e.message : 'Failed to generate exercise')
    } finally {
      setLoadingEx(false)
    }
  }

  // Load first exercise once progress hydrates from localStorage
  const initialLoadDone = useRef(false)
  useEffect(() => {
    if (mode === 'word-bubbles' && !initialLoadDone.current && progress.totalAnswered >= 0) {
      initialLoadDone.current = true
      loadExercise(progress.currentLevel, [])
    }
  }, [progress.currentLevel]) // eslint-disable-line react-hooks/exhaustive-deps

  function onWBComplete(correct: boolean, missed: string[]) {
    recordAnswer(correct, exercise?.correctWords ?? [])
    setSessionScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))

    const allWords = [...(exercise?.correctWords ?? []), ...(exercise?.distractors ?? [])]
    const newMissed: string[] = []
    missed.forEach((greek) => {
      const found = allWords.find((w) => w.greek === greek)
      if (found) {
        addFlashcard(greek, found.english)
        newMissed.push(greek)
      }
    })
    if (newMissed.length > 0) {
      setRecentlyMissed((prev) => [...new Set([...newMissed, ...prev])].slice(0, 10))
    }
  }

  function nextExercise() {
    loadExercise(progress.currentLevel, recentlyMissed)
  }

  function switchMode(m: Mode) {
    setMode(m)
    setFtIdx(0)
    setFtScore({ correct: 0, total: 0 })
    setSessionScore({ correct: 0, total: 0 })
    if (m === 'word-bubbles' && !exercise) {
      loadExercise(progress.currentLevel, recentlyMissed)
    }
  }

  function onFTComplete(correct: boolean) {
    setFtScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    if (!correct) FT_EXERCISES[ftIdx].missing.forEach((w) => addFlashcard(w.greek, w.english))
  }

  const toNextLevel = Math.max(0, 3 - progress.consecutiveCorrect)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Practice</h1>
          <p className="text-gray-500">Missed words are automatically saved as flashcards.</p>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${levelInfo.color}`}>
            {levelInfo.label} · {levelInfo.cefr}
          </span>
          {progress.currentLevel < 6 && (
            <p className="text-xs text-gray-400 mt-1">{toNextLevel} correct in a row to level up</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        {(['word-bubbles', 'free-typing'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              mode === m
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:border-blue-400'
            }`}
          >
            {m === 'word-bubbles' ? '🫧 Word Bubbles' : '⌨️ Free Typing'}
          </button>
        ))}
      </div>

      {mode === 'word-bubbles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Session: {sessionScore.correct}/{sessionScore.total} correct
            </span>
            <span>
              {progress.consecutiveCorrect >= 2
                ? `🔥 ${progress.consecutiveCorrect} in a row`
                : progress.consecutiveIncorrect >= 2
                  ? `${progress.consecutiveIncorrect} incorrect in a row`
                  : `Overall: ${progress.totalAnswered > 0 ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0}% accuracy`}
            </span>
          </div>

          {loadingEx && (
            <div className="bg-white rounded-2xl p-10 text-center border border-blue-100 shadow-sm">
              <p className="text-gray-400 animate-pulse">Generating your next exercise…</p>
            </div>
          )}

          {exError && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              ⚠️ {exError}
              <button
                onClick={() => loadExercise(progress.currentLevel, recentlyMissed)}
                className="ml-3 underline"
              >
                Retry
              </button>
            </div>
          )}

          {exercise && !loadingEx && (
            <>
              <WordBubbles
                key={exerciseKey}
                prompt={exercise.prompt}
                promptTranslation="Select the correct Greek words"
                wordOptions={shuffledOptions}
                correctWords={exercise.correctWords.map((w) => w.greek)}
                onComplete={onWBComplete}
              />
              <div className="flex justify-end">
                <button
                  onClick={nextExercise}
                  className="px-6 py-2 text-sm text-blue-600 border border-blue-300 rounded-full hover:bg-blue-50"
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {mode === 'free-typing' && (
        <div className="space-y-4">
          {ftIdx < FT_EXERCISES.length ? (
            <>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  Exercise {ftIdx + 1} of {FT_EXERCISES.length}
                </span>
                <span>
                  Score: {ftScore.correct}/{ftScore.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(ftIdx / FT_EXERCISES.length) * 100}%` }}
                />
              </div>
              <FreeTyping
                key={FT_EXERCISES[ftIdx].id}
                prompt={FT_EXERCISES[ftIdx].prompt}
                promptTranslation={FT_EXERCISES[ftIdx].promptTranslation}
                expectedAnswer={FT_EXERCISES[ftIdx].expectedAnswer}
                hint={FT_EXERCISES[ftIdx].hint}
                onComplete={onFTComplete}
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setFtIdx((i) => i + 1)}
                  className="px-6 py-2 text-sm text-blue-600 border border-blue-300 rounded-full hover:bg-blue-50"
                >
                  {ftIdx < FT_EXERCISES.length - 1 ? 'Next →' : 'Finish'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-blue-100">
              <p className="text-5xl mb-4">🎉</p>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Complete!</h2>
              <p className="text-gray-500 text-lg mb-6">
                You got{' '}
                <span className="text-blue-600 font-bold">
                  {ftScore.correct}/{ftScore.total}
                </span>{' '}
                correct
              </p>
              <button
                onClick={() => {
                  setFtIdx(0)
                  setFtScore({ correct: 0, total: 0 })
                }}
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow"
              >
                Practice Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Level change toast */}
      {levelToast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full shadow-lg text-sm font-medium z-50 text-white ${
            levelToast === 'up' ? 'bg-green-600' : 'bg-orange-500'
          }`}
        >
          {levelToast === 'up'
            ? `Level up! You're now ${LEVEL_INFO[progress.currentLevel].label} · ${LEVEL_INFO[progress.currentLevel].cefr}`
            : `Dropping back to ${LEVEL_INFO[progress.currentLevel].label} · ${LEVEL_INFO[progress.currentLevel].cefr} for more practice`}
        </div>
      )}
    </div>
  )
}
