import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import ReadingMode from '../components/ReadingMode/ReadingMode'
import { useFlashcards } from '../hooks/useFlashcards'
import type { ReadingWord } from '../types'

export const Route = createFileRoute('/reading')({
  component: ReadingPage,
})

const PASSAGES = [
  {
    id: 'p1',
    title: 'Στο καφενείο (At the café)',
    words: [
      { id: 'w1', greek: 'Καλημέρα!', english: 'Good morning!', isKnown: false },
      { id: 'w2', greek: 'Θέλω', english: 'I want', isKnown: false },
      { id: 'w3', greek: 'έναν', english: 'one (masc.)', isKnown: false },
      { id: 'w4', greek: 'καφέ', english: 'coffee', isKnown: false },
      { id: 'w5', greek: 'παρακαλώ.', english: 'please.', isKnown: false },
      { id: 'w6', greek: 'Πόσο', english: 'How much', isKnown: false },
      { id: 'w7', greek: 'κάνει;', english: 'does it cost?', isKnown: false },
      { id: 'w8', greek: 'Δύο', english: 'Two', isKnown: false },
      { id: 'w9', greek: 'ευρώ.', english: 'euros.', isKnown: false },
      { id: 'w10', greek: 'Ευχαριστώ', english: 'Thank you', isKnown: false },
      { id: 'w11', greek: 'πολύ!', english: 'very much!', isKnown: false },
    ],
  },
  {
    id: 'p2',
    title: 'Οικογένεια (Family)',
    words: [
      { id: 'w1', greek: 'Η', english: 'The (fem.)', isKnown: false },
      { id: 'w2', greek: 'οικογένειά', english: 'family', isKnown: false },
      { id: 'w3', greek: 'μου', english: 'my', isKnown: false },
      { id: 'w4', greek: 'είναι', english: 'is', isKnown: false },
      { id: 'w5', greek: 'μεγάλη.', english: 'big.', isKnown: false },
      { id: 'w6', greek: 'Έχω', english: 'I have', isKnown: false },
      { id: 'w7', greek: 'δύο', english: 'two', isKnown: false },
      { id: 'w8', greek: 'αδέρφια', english: 'siblings', isKnown: false },
      { id: 'w9', greek: 'και', english: 'and', isKnown: false },
      { id: 'w10', greek: 'τρεις', english: 'three', isKnown: false },
      { id: 'w11', greek: 'ξαδέρφους.', english: 'cousins.', isKnown: false },
    ],
  },
  {
    id: 'p3',
    title: 'Στην αγορά (At the market)',
    words: [
      { id: 'w1', greek: 'Πού', english: 'Where', isKnown: false },
      { id: 'w2', greek: 'είναι', english: 'is', isKnown: false },
      { id: 'w3', greek: 'η', english: 'the (fem.)', isKnown: false },
      { id: 'w4', greek: 'αγορά;', english: 'market?', isKnown: false },
      { id: 'w5', greek: 'Θέλω', english: 'I want', isKnown: false },
      { id: 'w6', greek: 'φρέσκα', english: 'fresh', isKnown: false },
      { id: 'w7', greek: 'λαχανικά', english: 'vegetables', isKnown: false },
      { id: 'w8', greek: 'και', english: 'and', isKnown: false },
      { id: 'w9', greek: 'φρούτα.', english: 'fruits.', isKnown: false },
    ],
  },
]

function ReadingPage() {
  const [pidx, setPidx] = useState(0)
  const { addFlashcard } = useFlashcards()
  const passage = PASSAGES[pidx]

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Reading Mode</h1>
        <p className="text-gray-500">
          Read Greek passages and click words you don't know to save them.
        </p>
      </div>
      <div className="flex gap-3 flex-wrap">
        {PASSAGES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setPidx(i)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              i === pidx
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:border-green-400'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>
      <ReadingMode
        key={passage.id}
        title={passage.title}
        words={passage.words as ReadingWord[]}
        onAddFlashcard={addFlashcard}
      />
    </div>
  )
}
