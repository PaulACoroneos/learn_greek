import { useState, useRef, useEffect } from 'react'
import type { ConversationMessage } from '../../types'

const STARTERS = [
  { greek: 'Γεια σου! Πώς σε λένε;', english: "Hello! What's your name?" },
  { greek: 'Τι κάνεις σήμερα;', english: 'How are you today?' },
  { greek: 'Πού μένεις;', english: 'Where do you live?' },
  { greek: 'Τι θέλεις να πιεις;', english: 'What would you like to drink?' },
]

function mockResponse(input: string): { content: string; feedback: string } {
  const l = input.toLowerCase()
  if (l.includes('γεια') || l.includes('hello'))
    return {
      content: 'Γεια σου! Χαίρομαι που σε γνωρίζω. Πώς σε λένε;',
      feedback: 'Great greeting! "Γεια σου" is informal; use "Γεια σας" for formal situations.',
    }
  if (l.includes('καλά') || l.includes('good') || l.includes('fine'))
    return {
      content: 'Χαίρομαι! Εγώ είμαι επίσης καλά, ευχαριστώ.',
      feedback: '"Καλά" means good/well. You can also say "Πολύ καλά" for "Very well".',
    }
  if (l.includes('ευχαριστώ') || l.includes('thank'))
    return {
      content: 'Παρακαλώ! Συνέχισε την εξάσκησή σου!',
      feedback: '"Ευχαριστώ" is perfect! "Παρακαλώ" = You\'re welcome.',
    }
  return {
    content: 'Πολύ καλά! Μπορείς να μου πεις περισσότερα;',
    feedback: 'Keep going! Try phrases like "Ναι" (yes), "Όχι" (no), or "Δεν ξέρω" (I don\'t know).',
  }
}

interface Props {
  onAddFlashcard: (greek: string, english: string) => boolean
}

export default function Conversation({ onAddFlashcard }: Props) {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Γεια σου! Καλώς ήρθες στην εξάσκηση συνομιλίας. Πώς σε λένε;',
      feedback: 'Translation: "Hello! Welcome to conversation practice. What is your name?"',
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [starterIdx, setStarterIdx] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    const userMsg: ConversationMessage = { id: String(Date.now()), role: 'user', content: input, timestamp: new Date().toISOString() }
    setMessages((p) => [...p, userMsg])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      const { content, feedback } = mockResponse(input)
      setMessages((p) => [...p, { id: String(Date.now()), role: 'assistant', content, feedback, timestamp: new Date().toISOString() }])
      setLoading(false)
    }, 700)
  }

  const next = STARTERS[starterIdx]

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
              <p className="leading-snug">{m.content}</p>
              {m.feedback && <div className="mt-2 pt-2 border-t border-white/20 text-xs opacity-75">{m.feedback}</div>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-gray-400 text-sm animate-pulse">Typing…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-gray-100 px-4 py-3 space-y-2 bg-gray-50">
        <button
          onClick={() => { setInput(next.greek); setStarterIdx((i) => (i + 1) % STARTERS.length) }}
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
          <button type="submit" disabled={!input.trim() || loading} className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            Send
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center">
          Missed a word?{' '}
          <button className="text-blue-400 hover:underline" onClick={() => onAddFlashcard('Δεν ξέρω', "I don't know")}>
            Add to flashcards
          </button>
        </p>
      </div>
    </div>
  )
}
