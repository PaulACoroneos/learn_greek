import { useState } from 'react'
import type { ReadingWord } from '../../types'

interface Props {
  title: string
  words: ReadingWord[]
  onAddFlashcard: (greek: string, english: string) => boolean
}

export default function ReadingMode({ title, words, onAddFlashcard }: Props) {
  const [states, setStates] = useState<ReadingWord[]>(words)
  const [selected, setSelected] = useState<ReadingWord | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  function handleAdd(word: ReadingWord) {
    if (!word.english) return
    onAddFlashcard(word.greek, word.english)
    setAdded((p) => new Set([...p, word.id]))
    setStates((p) => p.map((w) => (w.id === word.id ? { ...w, isKnown: true } : w)))
    setToast(`Added "${word.greek}" to flashcards!`)
    setTimeout(() => setToast(null), 2500)
    setSelected(null)
  }

  function markKnown(word: ReadingWord) {
    setStates((p) => p.map((w) => (w.id === word.id ? { ...w, isKnown: true } : w)))
    setSelected(null)
  }

  return (
    <div className="space-y-5 relative">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <p className="text-sm text-gray-500">
        Click any word you don&apos;t know to define it or add it to flashcards.
      </p>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 leading-loose text-xl">
        {states.map((word, i) => (
          <span key={word.id}>
            <button
              onClick={() => setSelected(word)}
              aria-label={`Word: ${word.greek}`}
              className={`rounded px-0.5 transition-colors ${
                added.has(word.id)
                  ? 'text-green-600 font-medium'
                  : word.isKnown
                    ? 'text-gray-700 hover:bg-yellow-50'
                    : 'text-blue-700 underline decoration-dotted hover:bg-blue-50'
              }`}
            >
              {word.greek}
            </button>
            {i < states.length - 1 && ' '}
          </span>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-3xl font-bold text-blue-700">{selected.greek}</p>
                {selected.english && (
                  <p className="text-gray-600 mt-1 text-lg">{selected.english}</p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl ml-4"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-3 flex-wrap">
              {selected.english && !added.has(selected.id) && (
                <button
                  onClick={() => handleAdd(selected)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700"
                >
                  + Add to Flashcards
                </button>
              )}
              {added.has(selected.id) && (
                <span className="flex-1 text-center px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium border border-green-200">
                  ✓ In Flashcards
                </span>
              )}
              <button
                onClick={() => markKnown(selected)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200"
              >
                I know this
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
