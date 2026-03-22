import { createFileRoute } from '@tanstack/react-router'
import Conversation from '../components/Conversation/Conversation'
import { useFlashcards } from '../hooks/useFlashcards'

export const Route = createFileRoute('/conversation')({
  component: ConversationPage,
})

function ConversationPage() {
  const { addFlashcard } = useFlashcards()
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Conversation Practice</h1>
        <p className="text-gray-500">
          Simulate real Greek conversations and get feedback on your responses.
        </p>
      </div>
      <Conversation onAddFlashcard={addFlashcard} />
    </div>
  )
}
