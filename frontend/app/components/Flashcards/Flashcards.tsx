import { useState } from 'react'
import type { Flashcard } from '../../types'

interface Props {
  flashcards: Flashcard[]
  onRemove: (id: string) => void
  onMarkReviewed: (id: string) => void
  onClearAll: () => void
}

export default function Flashcards({ flashcards, onRemove, onMarkReviewed, onClearAll }: Props) {
  const [reviewing, setReviewing] = useState(false)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-5xl mb-4">📭</p>
        <p className="text-xl font-medium">No flashcards yet</p>
        <p className="text-sm mt-2">
          Words you miss during practice or save from reading appear here.
        </p>
      </div>
    )
  }

  const current = flashcards[index]

  if (reviewing && current) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setReviewing(false)}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to list
          </button>
          <span className="text-sm text-gray-500">
            {index + 1} / {flashcards.length}
          </span>
        </div>
        <div
          className="bg-white rounded-2xl shadow-md border border-blue-100 p-10 text-center cursor-pointer select-none min-h-52 flex flex-col justify-center"
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) =>
            e.key === 'Enter' || e.key === ' ' ? setFlipped((f) => !f) : undefined
          }
          role="button"
          tabIndex={0}
          aria-label={flipped ? 'Show Greek' : 'Show English translation'}
        >
          {!flipped ? (
            <>
              <p className="text-4xl font-bold text-blue-700 mb-2">{current.greek}</p>
              {current.transliteration && (
                <p className="text-gray-400 italic">{current.transliteration}</p>
              )}
              <p className="text-sm text-gray-400 mt-4">Click to reveal translation</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-semibold text-gray-800">{current.english}</p>
              {current.example && (
                <p className="text-sm text-gray-500 italic mt-3 border-t pt-3">
                  e.g. {current.example}
                </p>
              )}
            </>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              onMarkReviewed(current.id)
              setFlipped(false)
              if (index < flashcards.length - 1) setIndex((i) => i + 1)
              else setReviewing(false)
            }}
            className="px-6 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600"
          >
            ✓ Got it
          </button>
          <button
            onClick={() => {
              setFlipped(false)
              if (index < flashcards.length - 1) setIndex((i) => i + 1)
              else setReviewing(false)
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300"
          >
            Skip
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-gray-600">
          <span className="font-semibold text-blue-700">{flashcards.length}</span> flashcard
          {flashcards.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIndex(0)
              setFlipped(false)
              setReviewing(true)
            }}
            className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700"
          >
            Review All
          </button>
          <button
            onClick={onClearAll}
            className="px-5 py-2 bg-red-100 text-red-600 rounded-full text-sm font-semibold hover:bg-red-200"
          >
            Clear All
          </button>
        </div>
      </div>
      <ul className="space-y-3">
        {flashcards.map((fc) => (
          <li
            key={fc.id}
            className="bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 flex items-start justify-between gap-4"
          >
            <div>
              <p className="text-xl font-semibold text-blue-700">{fc.greek}</p>
              {fc.transliteration && (
                <p className="text-sm text-gray-400 italic">{fc.transliteration}</p>
              )}
              <p className="text-gray-700 mt-1">{fc.english}</p>
              {fc.example && <p className="text-sm text-gray-400 italic mt-1">{fc.example}</p>}
              <p className="text-xs text-gray-300 mt-2">
                Reviewed {fc.reviewCount} time{fc.reviewCount !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => onRemove(fc.id)}
              className="text-gray-300 hover:text-red-400 text-lg shrink-0"
              aria-label={`Remove ${fc.greek}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
