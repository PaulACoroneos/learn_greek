import { useState } from 'react'

interface Props {
  prompt: string
  promptTranslation: string
  expectedAnswer: string
  hint?: string
  onComplete: (correct: boolean, userAnswer: string) => void
}

function normalize(s: string) {
  return s.trim().toLowerCase()
}

export default function FreeTyping({ prompt, promptTranslation, expectedAnswer, hint, onComplete }: Props) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitted || !input.trim()) return
    const ok = normalize(input) === normalize(expectedAnswer)
    setCorrect(ok)
    setSubmitted(true)
    onComplete(ok, input)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
        <p className="text-lg text-gray-500 mb-1">Type the Greek translation:</p>
        <p className="text-2xl font-semibold text-gray-800">{prompt}</p>
        <p className="text-sm text-gray-400 mt-1 italic">{promptTranslation}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitted}
          placeholder="Type your answer in Greek..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xl focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"
          autoComplete="off"
          spellCheck={false}
          lang="el"
        />
        <div className="flex gap-3 items-center">
          {!submitted && (
            <>
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check
              </button>
              {hint && (
                <button
                  type="button"
                  onClick={() => setShowHint((s) => !s)}
                  className="text-sm text-blue-500 hover:underline"
                >
                  {showHint ? 'Hide hint' : 'Show hint'}
                </button>
              )}
            </>
          )}
        </div>
        {showHint && hint && !submitted && (
          <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            💡 {hint}
          </p>
        )}
      </form>

      {submitted && correct !== null && (
        <div
          className={`rounded-xl p-4 ${correct ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
          {correct ? (
            <p className="font-semibold text-lg">✅ Correct!</p>
          ) : (
            <>
              <p className="font-semibold text-lg">❌ Not quite</p>
              <p className="text-sm mt-1">
                Correct answer: <span className="font-medium text-lg">{expectedAnswer}</span>
              </p>
              <p className="text-sm mt-0.5">
                Your answer: <span className="line-through">{input}</span>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
