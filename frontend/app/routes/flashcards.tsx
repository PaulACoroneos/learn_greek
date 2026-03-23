import { createFileRoute } from '@tanstack/react-router'
import Flashcards from '../components/Flashcards/Flashcards'
import { useFlashcards } from '../hooks/useFlashcards'

export const Route = createFileRoute('/flashcards')({
  component: FlashcardsPage,
})

function FlashcardsPage() {
  const { flashcards, removeFlashcard, markReviewed, clearAll } = useFlashcards()
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-1">My Flashcards</h1>
        <p className="text-gray-500">Words you missed during practice or saved from reading.</p>
      </div>
      <Flashcards
        flashcards={flashcards}
        onRemove={removeFlashcard}
        onMarkReviewed={markReviewed}
        onClearAll={clearAll}
      />
    </div>
  )
}
