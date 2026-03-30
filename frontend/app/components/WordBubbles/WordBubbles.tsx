import { useState } from 'react'
import type { WordBubble } from '../../types'

interface Props {
  prompt: string
  promptTranslation: string
  wordOptions: Omit<WordBubble, 'selected'>[]
  correctWords: string[] // ordered
  onComplete: (correct: boolean, missed: string[]) => void
}

export default function WordBubbles({
  prompt,
  promptTranslation,
  wordOptions,
  correctWords,
  onComplete,
}: Props) {
  // sentence = words placed in order by the user
  const [sentence, setSentence] = useState<Omit<WordBubble, 'selected'>[]>([])
  const [available, setAvailable] = useState(wordOptions)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ correct: boolean; missed: string[] } | null>(null)

  function pickWord(word: Omit<WordBubble, 'selected'>) {
    if (submitted) return
    setSentence((s) => [...s, word])
    setAvailable((a) => a.filter((w) => w.id !== word.id))
  }

  function returnWord(word: Omit<WordBubble, 'selected'>, idx: number) {
    if (submitted) return
    setSentence((s) => s.filter((_, i) => i !== idx))
    setAvailable((a) => {
      // re-insert at original position
      const originalIdx = wordOptions.findIndex((w) => w.id === word.id)
      const next = [...a]
      next.splice(originalIdx, 0, word)
      return next
    })
  }

  function handleSubmit() {
    if (submitted || sentence.length === 0) return
    const formed = sentence.map((w) => w.greek)
    const correct = formed.join(' ') === correctWords.join(' ')
    // words that are incorrect or not placed correctly (includes extra words)
    const missed = correctWords.filter((w) => !formed.includes(w))
    setResult({ correct, missed })
    setSubmitted(true)
    onComplete(correct, missed)
  }

  function trayWordStyle(idx: number) {
    if (!submitted) return 'bg-blue-600 text-white hover:bg-blue-700'
    const formed = sentence.map((w) => w.greek)
    if (formed[idx] === correctWords[idx]) return 'bg-green-500 text-white'
    return 'bg-red-500 text-white'
  }

  return (
    <div className="space-y-5">
      {/* Prompt */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
        <p className="text-lg text-gray-500 mb-1">Translate:</p>
        <p className="text-2xl font-semibold text-gray-800">{prompt}</p>
        <p className="text-sm text-gray-400 mt-1 italic">{promptTranslation}</p>
      </div>

      {/* Sentence tray */}
      <div className="min-h-14 bg-blue-50 rounded-xl border-2 border-dashed border-blue-200 p-3 flex flex-wrap gap-2 items-center">
        {sentence.length === 0 && (
          <p className="text-sm text-blue-300 select-none">
            Tap words below to build the sentence…
          </p>
        )}
        {sentence.map((word, idx) => (
          <button
            key={`${word.id}-${idx}`}
            onClick={() => returnWord(word, idx)}
            disabled={submitted}
            className={`px-4 py-2 rounded-full text-base font-medium transition-all shadow-sm disabled:cursor-default ${trayWordStyle(idx)}`}
          >
            {word.greek}
          </button>
        ))}
      </div>

      {/* Available bubbles */}
      <div className="flex flex-wrap gap-3 justify-center min-h-12">
        {available.map((word) => (
          <button
            key={word.id}
            onClick={() => pickWord(word)}
            disabled={submitted}
            className="px-5 py-2.5 rounded-full text-lg font-medium bg-white text-gray-800 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm disabled:opacity-40 disabled:cursor-default"
          >
            {word.greek}
          </button>
        ))}
      </div>

      {/* Submit */}
      {!submitted && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={sentence.length === 0}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-default transition-colors shadow"
          >
            Submit
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`rounded-xl p-4 ${result.correct ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
          {result.correct ? (
            <p className="font-semibold text-lg text-center">✅ Correct!</p>
          ) : (
            <div className="space-y-1">
              <p className="font-semibold text-lg">❌ Not quite</p>
              <p className="text-sm">
                Correct order: <span className="font-medium">{correctWords.join(' ')}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
