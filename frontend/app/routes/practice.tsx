import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import WordBubbles from '../components/WordBubbles/WordBubbles'
import FreeTyping from '../components/FreeTyping/FreeTyping'
import { useFlashcards } from '../hooks/useFlashcards'

export const Route = createFileRoute('/practice')({
  component: PracticePage,
})

type Mode = 'word-bubbles' | 'free-typing'

const WB_EXERCISES = [
  {
    id: 'wb1',
    prompt: 'Good morning',
    promptTranslation: 'Select the correct Greek word',
    wordOptions: [
      { id: 'w1', greek: 'Καλημέρα', english: 'Good morning' },
      { id: 'w2', greek: 'Καληνύχτα', english: 'Good night' },
      { id: 'w3', greek: 'Γεια', english: 'Hello' },
      { id: 'w4', greek: 'Αντίο', english: 'Goodbye' },
    ],
    correctWords: ['Καλημέρα'],
  },
  {
    id: 'wb2',
    prompt: 'I would like water, please.',
    promptTranslation: 'Select words to form the sentence',
    wordOptions: [
      { id: 'w1', greek: 'Θέλω', english: 'I want' },
      { id: 'w2', greek: 'νερό', english: 'water' },
      { id: 'w3', greek: 'παρακαλώ', english: 'please' },
      { id: 'w4', greek: 'γάλα', english: 'milk' },
      { id: 'w5', greek: 'καφέ', english: 'coffee' },
    ],
    correctWords: ['Θέλω', 'νερό', 'παρακαλώ'],
  },
  {
    id: 'wb3',
    prompt: 'Where is the bathroom?',
    promptTranslation: 'Select the correct phrase',
    wordOptions: [
      { id: 'w1', greek: 'Πού', english: 'Where' },
      { id: 'w2', greek: 'είναι', english: 'is' },
      { id: 'w3', greek: 'η τουαλέτα', english: 'the bathroom' },
      { id: 'w4', greek: 'το μαγαζί', english: 'the shop' },
      { id: 'w5', greek: 'Πώς', english: 'How' },
    ],
    correctWords: ['Πού', 'είναι', 'η τουαλέτα'],
  },
]

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

function PracticePage() {
  const [mode, setMode] = useState<Mode>('word-bubbles')
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const { addFlashcard } = useFlashcards()

  const exercises = mode === 'word-bubbles' ? WB_EXERCISES : FT_EXERCISES
  const done = idx >= exercises.length
  const current = exercises[idx] as (typeof WB_EXERCISES)[0] | (typeof FT_EXERCISES)[0] | undefined

  function switchMode(m: Mode) {
    setMode(m)
    setIdx(0)
    setScore({ correct: 0, total: 0 })
  }
  function nextEx() {
    setIdx((i) => i + 1)
  }
  function reset() {
    setIdx(0)
    setScore({ correct: 0, total: 0 })
  }

  function onWBComplete(correct: boolean, missed: string[]) {
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    if (!correct) {
      const ex = WB_EXERCISES[idx]
      missed.forEach((greek) => {
        const found = ex.wordOptions.find((w) => w.greek === greek)
        if (found) addFlashcard(greek, found.english)
      })
    }
  }

  function onFTComplete(correct: boolean) {
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    if (!correct) FT_EXERCISES[idx].missing.forEach((w) => addFlashcard(w.greek, w.english))
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Practice</h1>
        <p className="text-gray-500">Missed words are automatically saved as flashcards.</p>
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

      {!done ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Exercise {idx + 1} of {exercises.length}
            </span>
            <span>
              Score: {score.correct}/{score.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${(idx / exercises.length) * 100}%` }}
            />
          </div>

          {mode === 'word-bubbles' ? (
            <WordBubbles
              key={current?.id}
              prompt={current?.prompt ?? ''}
              promptTranslation={current?.promptTranslation ?? ''}
              wordOptions={(current as (typeof WB_EXERCISES)[0])?.wordOptions ?? []}
              correctWords={(current as (typeof WB_EXERCISES)[0])?.correctWords ?? []}
              onComplete={onWBComplete}
            />
          ) : (
            <FreeTyping
              key={current?.id}
              prompt={(current as (typeof FT_EXERCISES)[0])?.prompt ?? ''}
              promptTranslation={(current as (typeof FT_EXERCISES)[0])?.promptTranslation ?? ''}
              expectedAnswer={(current as (typeof FT_EXERCISES)[0])?.expectedAnswer ?? ''}
              hint={(current as (typeof FT_EXERCISES)[0])?.hint}
              onComplete={onFTComplete}
            />
          )}

          <div className="flex justify-end">
            <button
              onClick={nextEx}
              className="px-6 py-2 text-sm text-blue-600 border border-blue-300 rounded-full hover:bg-blue-50"
            >
              {idx < exercises.length - 1 ? 'Next →' : 'Finish'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-blue-100">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Complete!</h2>
          <p className="text-gray-500 text-lg mb-6">
            You got{' '}
            <span className="text-blue-600 font-bold">
              {score.correct}/{score.total}
            </span>{' '}
            correct
          </p>
          <button
            onClick={reset}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow"
          >
            Practice Again
          </button>
        </div>
      )}
    </div>
  )
}
