import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { useFlashcards } from '../hooks/useFlashcards'
import {
  generateReadingPassage,
  explainWordInContext,
  type ReadingLevel,
  type PassageData,
  type WordExplanation,
} from '../server-fns/reading'
import { sendChatMessage } from '../server-fns/chat'

export const Route = createFileRoute('/reading')({
  component: ReadingPage,
})

// ── types ────────────────────────────────────────────────────────────────────

type WordState = 'unknown' | 'explained' | 'known' | 'saved'

interface Token {
  id: string
  text: string
  state: WordState
  explanation: WordExplanation | null
}

interface ComprehensionMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type Phase = 'setup' | 'generating' | 'reading' | 'comprehension'

// ── helpers ──────────────────────────────────────────────────────────────────

function tokenize(text: string): Token[] {
  return text.split(/\s+/).map((word, i) => ({
    id: `t${i}`,
    text: word,
    state: 'unknown' as WordState,
    explanation: null,
  }))
}

const LEVELS: { value: ReadingLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'A1–A2 · present tense · everyday words' },
  { value: 'intermediate', label: 'Intermediate', desc: 'B1 · past tense · varied vocab' },
  { value: 'advanced', label: 'Advanced', desc: 'B2 · rich vocab · varied structures' },
]

// ── main component ────────────────────────────────────────────────────────────

function ReadingPage() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [level, setLevel] = useState<ReadingLevel>('beginner')
  const [passage, setPassage] = useState<PassageData | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loadingWord, setLoadingWord] = useState(false)
  const [generatingPassage, setGeneratingPassage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // custom passage paste
  const [customText, setCustomText] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  // comprehension phase
  const [comprehensionMsgs, setComprehensionMsgs] = useState<ComprehensionMessage[]>([])
  const [compInput, setCompInput] = useState('')
  const [loadingComp, setLoadingComp] = useState(false)
  const compBottomRef = useRef<HTMLDivElement>(null)

  const [toast, setToast] = useState<string | null>(null)
  const { addFlashcard } = useFlashcards()

  useEffect(() => {
    compBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comprehensionMsgs])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // ── passage generation ──────────────────────────────────────────────────

  async function handleGenerate() {
    setGeneratingPassage(true)
    setError(null)
    setPhase('generating')
    try {
      const data = await generateReadingPassage({ data: { level } })
      setPassage(data)
      setTokens(tokenize(data.greekText))
      setSelectedId(null)
      setComprehensionMsgs([])
      setPhase('reading')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate passage.')
      setPhase('setup')
    } finally {
      setGeneratingPassage(false)
    }
  }

  function handleUseCustom() {
    if (!customText.trim()) return
    const data: PassageData = {
      title: 'Custom passage',
      greekText: customText.trim(),
      englishSummary: '',
    }
    setPassage(data)
    setTokens(tokenize(data.greekText))
    setSelectedId(null)
    setComprehensionMsgs([])
    setPhase('reading')
    setShowCustom(false)
  }

  // ── word explanation ────────────────────────────────────────────────────

  async function handleWordClick(token: Token) {
    setSelectedId(token.id)
    if (token.explanation) return // already fetched

    setLoadingWord(true)
    try {
      const result = await explainWordInContext({
        data: { passage: passage!.greekText, word: token.text },
      })
      setTokens((prev) =>
        prev.map((t) => (t.id === token.id ? { ...t, explanation: result, state: 'explained' } : t))
      )
    } catch {
      // leave explanation null — show a fallback message
    } finally {
      setLoadingWord(false)
    }
  }

  function handleAddFlashcard(token: Token) {
    if (!token.explanation) return
    const added = addFlashcard(token.text, token.explanation.explanation)
    if (added) {
      setTokens((prev) => prev.map((t) => (t.id === token.id ? { ...t, state: 'saved' } : t)))
      showToast(`"${token.text}" added to flashcards`)
    } else {
      showToast(`"${token.text}" is already in your flashcards`)
    }
    setSelectedId(null)
  }

  function handleMarkKnown(token: Token) {
    setTokens((prev) => prev.map((t) => (t.id === token.id ? { ...t, state: 'known' } : t)))
    setSelectedId(null)
  }

  // ── comprehension Q&A ───────────────────────────────────────────────────

  async function startComprehension() {
    setPhase('comprehension')
    setLoadingComp(true)
    try {
      const result = await sendChatMessage({
        data: {
          mode: 'reading',
          messages: [
            {
              role: 'user',
              content: `Here is the passage the student just read:\n\n"${passage!.greekText}"\n\nPlease ask a comprehension question.`,
            },
          ],
        },
      })
      setComprehensionMsgs([
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          role: 'assistant',
          content: result.content,
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start comprehension.')
      setPhase('reading')
    } finally {
      setLoadingComp(false)
    }
  }

  async function sendComprehensionReply(e: React.FormEvent) {
    e.preventDefault()
    if (!compInput.trim() || loadingComp) return
    const userMsg: ComprehensionMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: 'user',
      content: compInput,
    }
    const updated = [...comprehensionMsgs, userMsg]
    setComprehensionMsgs(updated)
    setCompInput('')
    setLoadingComp(true)
    try {
      const apiMessages = [
        {
          role: 'user' as const,
          content: `Passage: "${passage!.greekText}"\n\nPlease ask a comprehension question.`,
        },
        ...updated.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ]
      const result = await sendChatMessage({ data: { mode: 'reading', messages: apiMessages } })
      setComprehensionMsgs((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          role: 'assistant',
          content: result.content,
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send reply.')
    } finally {
      setLoadingComp(false)
    }
  }

  // ── selected token lookup ───────────────────────────────────────────────
  const selectedToken = tokens.find((t) => t.id === selectedId) ?? null

  // ── render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Reading Mode</h1>
        <p className="text-gray-500">
          Read a graded Greek passage, tap unknown words for context explanations, then answer
          comprehension questions.
        </p>
      </div>

      {/* ── SETUP ── */}
      {(phase === 'setup' || phase === 'generating') && (
        <div className="space-y-5">
          {/* level selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  level === l.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <p className="font-semibold text-gray-800">{l.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{l.desc}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generatingPassage}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {generatingPassage ? '⏳ Generating passage…' : '📖 Generate Passage'}
          </button>

          {/* paste your own */}
          <div>
            <button
              onClick={() => setShowCustom((v) => !v)}
              className="text-sm text-blue-500 hover:underline"
            >
              {showCustom ? '▲ Hide' : '▼ Paste your own Greek text'}
            </button>
            {showCustom && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste Greek text from a YouTube video, song, article…"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
                <button
                  onClick={handleUseCustom}
                  disabled={!customText.trim()}
                  className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Use this text
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {/* ── READING ── */}
      {phase === 'reading' && passage && (
        <div className="space-y-5">
          {/* passage header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{passage.title}</h2>
              {passage.englishSummary && (
                <p className="text-sm text-gray-500 mt-0.5">{passage.englishSummary}</p>
              )}
            </div>
            <button
              onClick={() => setPhase('setup')}
              className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
            >
              ← New passage
            </button>
          </div>

          {/* instruction */}
          <p className="text-sm text-gray-500">
            Tap a word you don't know — Claude will explain it in context.
          </p>

          {/* passage */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 leading-loose text-xl">
            {tokens.map((token) => (
              <span key={token.id}>
                <button
                  onClick={() => handleWordClick(token)}
                  aria-label={`Word: ${token.text}`}
                  className={`rounded px-0.5 transition-colors ${
                    token.state === 'saved'
                      ? 'text-green-600 font-medium'
                      : token.state === 'known'
                        ? 'text-gray-400'
                        : token.state === 'explained'
                          ? 'text-purple-600 underline decoration-dotted hover:bg-purple-50'
                          : 'text-blue-700 underline decoration-dotted hover:bg-blue-50'
                  }`}
                >
                  {token.text}
                </button>{' '}
              </span>
            ))}
          </div>

          {/* legend */}
          <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
            <span>
              <span className="text-blue-700">underlined</span> = unknown
            </span>
            <span>
              <span className="text-purple-600">purple</span> = explained
            </span>
            <span>
              <span className="text-green-600">green</span> = saved to flashcards
            </span>
            <span>
              <span className="text-gray-400">grey</span> = I know this
            </span>
          </div>

          <button
            onClick={startComprehension}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            🎓 I've finished reading — ask me about it
          </button>

          {/* word explanation popup */}
          {selectedToken && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full space-y-4">
                <div className="flex justify-between items-start">
                  <p className="text-3xl font-bold text-blue-700">{selectedToken.text}</p>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl ml-4"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {loadingWord && !selectedToken.explanation && (
                  <p className="text-gray-500 text-sm animate-pulse">
                    Claude is explaining this word in context…
                  </p>
                )}

                {selectedToken.explanation && (
                  <div className="space-y-2">
                    <p className="text-gray-700">{selectedToken.explanation.explanation}</p>
                    {selectedToken.explanation.grammarNote && (
                      <p className="text-xs text-purple-600 bg-purple-50 rounded-lg px-3 py-2">
                        💡 {selectedToken.explanation.grammarNote}
                      </p>
                    )}
                  </div>
                )}

                {!loadingWord && !selectedToken.explanation && (
                  <p className="text-gray-400 text-sm">Could not load explanation.</p>
                )}

                <div className="flex gap-3 flex-wrap">
                  {selectedToken.explanation && selectedToken.state !== 'saved' && (
                    <button
                      onClick={() => handleAddFlashcard(selectedToken)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700"
                    >
                      + Add to Flashcards
                    </button>
                  )}
                  {selectedToken.state === 'saved' && (
                    <span className="flex-1 text-center px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium border border-green-200">
                      ✓ In Flashcards
                    </span>
                  )}
                  <button
                    onClick={() => handleMarkKnown(selectedToken)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200"
                  >
                    I know this
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── COMPREHENSION ── */}
      {phase === 'comprehension' && passage && (
        <div className="space-y-5">
          {/* mini passage recap */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-blue-400 font-medium mb-1 uppercase tracking-wide">
              Passage
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">{passage.greekText}</p>
          </div>

          <button
            onClick={() => setPhase('reading')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ← Back to reading
          </button>

          {/* chat */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
            <div className="p-4 space-y-4 min-h-[200px] max-h-[360px] overflow-y-auto">
              {loadingComp && comprehensionMsgs.length === 0 && (
                <p className="text-gray-400 text-sm animate-pulse">
                  Claude is preparing a question…
                </p>
              )}
              {comprehensionMsgs.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 text-sm ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loadingComp && comprehensionMsgs.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-gray-400 text-sm animate-pulse">
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={compBottomRef} />
            </div>

            <form
              onSubmit={sendComprehensionReply}
              className="border-t border-gray-100 px-4 py-3 flex gap-2 bg-gray-50"
            >
              <input
                type="text"
                value={compInput}
                onChange={(e) => setCompInput(e.target.value)}
                placeholder="Reply in Greek (or English)…"
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={!compInput.trim() || loadingComp}
                className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
