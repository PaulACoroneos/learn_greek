import { useState, useRef, useEffect } from 'react'
import type { ConversationMessage, AIMode } from '../../types'
import { sendChatMessage } from '../../server-fns/chat'
import { useFlashcards } from '../../hooks/useFlashcards'

const CONV_STORAGE_KEY = 'learn-greek-conversation'

const STARTERS = [
  { greek: 'Γεια σου! Πώς σε λένε;', english: "Hello! What's your name?" },
  { greek: 'Τι κάνεις σήμερα;', english: 'How are you today?' },
  { greek: 'Πού μένεις;', english: 'Where do you live?' },
  { greek: 'Τι θέλεις να πιεις;', english: 'What would you like to drink?' },
]

const MODES: { value: AIMode; label: string; icon: string }[] = [
  { value: 'conversation', label: 'Conversation', icon: '💬' },
  { value: 'grammar', label: 'Grammar Coach', icon: '📚' },
  { value: 'transliteration', label: 'Transliterate', icon: '🔤' },
  { value: 'sentence-gen', label: 'Make a Sentence', icon: '✍️' },
  { value: 'socratic', label: 'Socratic', icon: '🦉' },
]

const INITIAL_MESSAGE: ConversationMessage = {
  id: '0',
  role: 'assistant',
  content: 'Γεια σου! Καλώς ήρθες στην εξάσκηση συνομιλίας. Πώς σε λένε;',
  feedback: 'Translation: "Hello! Welcome to conversation practice. What is your name?"',
  timestamp: new Date().toISOString(),
}

function loadHistory(): ConversationMessage[] {
  try {
    const stored = localStorage.getItem(CONV_STORAGE_KEY)
    return stored ? (JSON.parse(stored) as ConversationMessage[]) : [INITIAL_MESSAGE]
  } catch {
    return [INITIAL_MESSAGE]
  }
}

interface Props {
  onAddFlashcard: (greek: string, english: string) => boolean
}

export default function Conversation({ onAddFlashcard }: Props) {
  const [messages, setMessages] = useState<ConversationMessage[]>(loadHistory)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [starterIdx, setStarterIdx] = useState(0)
  const [mode, setMode] = useState<AIMode>('conversation')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { flashcards } = useFlashcards()

  useEffect(() => {
    localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function clearHistory() {
    setMessages([INITIAL_MESSAGE])
    setError(null)
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    const userMsg: ConversationMessage = {
      id: String(Date.now()),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
      const knownWords =
        mode === 'sentence-gen' ? flashcards.map((fc) => fc.greek) : undefined

      const result = await sendChatMessage({
        data: { messages: apiMessages, mode, knownWords },
      })

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'assistant',
          content: result.content,
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const next = STARTERS[starterIdx]

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
      <div className="border-b border-gray-100 px-4 py-2 bg-gray-50 flex items-center gap-2 flex-wrap">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
              mode === m.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200'
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
        <button
          onClick={clearHistory}
          className="ml-auto text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded"
          title="Clear conversation"
        >
          🗑️ Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              <p className="leading-snug">{m.content}</p>
              {m.feedback && (
                <div className="mt-2 pt-2 border-t border-white/20 text-xs opacity-75">
                  {m.feedback}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-gray-400 text-sm animate-pulse">
              Thinking…
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            ⚠️ {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-100 px-4 py-3 space-y-2 bg-gray-50">
        <button
          onClick={() => {
            setInput(next.greek)
            setStarterIdx((i) => (i + 1) % STARTERS.length)
          }}
          className="text-xs text-blue-500 hover:underline"
        >
          💬 Try: "{next.english}"
        </button>
        <form onSubmit={send} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type in Greek or English…"
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center">
          Missed a word?{' '}
          <button
            className="text-blue-400 hover:underline"
            onClick={() => onAddFlashcard('Δεν ξέρω', "I don't know")}
          >
            Add to flashcards
          </button>
        </p>
      </div>
    </div>
  )
}
