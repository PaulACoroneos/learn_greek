import { useState } from 'react'
import type { WordBubble } from '../../types'

interface Props {
  prompt: string
  promptTranslation: string
  wordOptions: Omit<WordBubble, 'selected'>[]
  correctWords: string[]
  onComplete: (correct: boolean, missed: string[]) => void
}

export default function WordBubbles({
  prompt,
  promptTranslation,
  wordOptions,
  correctWords,
  onComplete,
}: Props) {
  const [bubbles, setBubbles] = useState<WordBubble[]>(
    wordOptions.map((w) => ({ ...w, selected: false }))
  )
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ correct: boolean; missed: string[] } | null>(null)

  function toggle(id: string) {
    if (submitted) return
    setBubbles((prev) => prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b)))
  }

  function handleSubmit() {
    if (submitted) return
    const selected = bubbles.filter((b) => b.selected).map((b) => b.greek)
    const missed = correctWords.filter((w) => !selected.includes(w))
    const extra = selected.filter((w) => !correctWords.includes(w))
    const correct = missed.length === 0 && extra.length === 0
    setResult({ correct, missed })
    setSubmitted(true)
    onComplete(correct, missed)
  }

  function bubbleStyle(b: WordBubble) {
    if (!submitted)
      return b.selected
        ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-105'
        : 'bg-white text-gray-800 hover:bg-blue-50 border border-gray-200'
    const should = correctWords.includes(b.greek)
    if (should && b.selected) return 'bg-green-500 text-white'
    if (should && !b.selected) return 'bg-red-100 text-red-700 ring-2 ring-red-400'
    if (!should && b.selected) return 'bg-red-500 text-white'
    return 'bg-white text-gray-400 border border-gray-200'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
        <p className="text-lg text-gray-500 mb-1">Translate:</p>
        <p className="text-2xl font-semibold text-gray-800">{prompt}</p>
        <p className="text-sm text-gray-400 mt-1 italic">{promptTranslation}</p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {bubbles.map((b) => (
          <button
            key={b.id}
            onClick={() => toggle(b.id)}
            disabled={submitted}
            aria-pressed={b.selected}
            className={`px-5 py-2.5 rounded-full text-lg font-medium transition-all shadow-sm cursor-pointer disabled:cursor-default ${bubbleStyle(b)}`}
          >
            {b.greek}
          </button>
        ))}
      </div>

      {!submitted && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow"
          >
            Submit
          </button>
        </div>
      )}

      {result && (
        <div
          className={`rounded-xl p-4 text-center ${result.correct ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
          {result.correct ? (
            <p className="font-semibold text-lg">✅ Correct!</p>
          ) : (
            <>
              <p className="font-semibold text-lg">❌ Not quite</p>
              {result.missed.length > 0 && (
                <p className="text-sm mt-1">
                  Missed: <span className="font-medium">{result.missed.join(', ')}</span>
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
