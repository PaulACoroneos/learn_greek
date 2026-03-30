import { createFileRoute, Link } from '@tanstack/react-router'
import { useProgress } from '../hooks/useProgress'
import { LEVEL_INFO } from './practice'

export const Route = createFileRoute('/progress')({
  component: ProgressPage,
})

const LEVEL_DESCRIPTIONS: Record<number, { greek: string; description: string; canDo: string }> = {
  1: {
    greek: 'Επίπεδο Α1',
    description: 'Survival',
    canDo:
      'Understand and use familiar everyday expressions and basic phrases. Introduce yourself and ask about people you know.',
  },
  2: {
    greek: 'Επίπεδο Α2',
    description: 'Elementary',
    canDo:
      'Understand sentences on familiar topics (shopping, local area, employment). Communicate in simple, routine tasks requiring a direct exchange.',
  },
  3: {
    greek: 'Επίπεδο Β1',
    description: 'Intermediate (Threshold)',
    canDo:
      'Handle most situations likely to arise while travelling. Produce simple connected text on familiar topics. Describe experiences and events.',
  },
  4: {
    greek: 'Επίπεδο Β2',
    description: 'Upper-Intermediate (Vantage)',
    canDo:
      'Understand the main ideas of complex text on concrete and abstract topics. Interact with a degree of fluency and spontaneity with native speakers.',
  },
  5: {
    greek: 'Επίπεδο Γ1',
    description: 'Advanced',
    canDo:
      'Understand demanding, longer texts. Express ideas fluently and spontaneously. Use language flexibly and effectively for social, academic and professional purposes.',
  },
  6: {
    greek: 'Επίπεδο Γ2',
    description: 'Mastery',
    canDo:
      'Understand virtually everything heard or read. Summarise information from different spoken and written sources, expressing yourself spontaneously and precisely.',
  },
}

function ProgressPage() {
  const { progress, resetProgress } = useProgress()

  const accuracy =
    progress.totalAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
      : 0

  const wordStats = Object.values(progress.wordStats)
  const mastered = wordStats.filter((w) => w.correct >= 2 && w.correct > w.incorrect)
  const struggling = wordStats.filter((w) => w.incorrect > w.correct && w.incorrect >= 1)
  const learning = wordStats.filter(
    (w) =>
      !mastered.find((m) => m.greek === w.greek) && !struggling.find((s) => s.greek === w.greek)
  )

  const levelInfo = LEVEL_INFO[progress.currentLevel]
  const levelDesc = LEVEL_DESCRIPTIONS[progress.currentLevel]
  const toNextLevel = Math.max(0, 3 - progress.consecutiveCorrect)

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">My Progress</h1>
          <p className="text-gray-500">Based on your practice sessions in this browser.</p>
        </div>
        {progress.totalAnswered > 0 && (
          <button
            onClick={() => {
              if (confirm('Reset all progress? This cannot be undone.')) resetProgress()
            }}
            className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-full transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {progress.totalAnswered === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-blue-100 shadow-sm">
          <p className="text-4xl mb-4">📚</p>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No data yet</h2>
          <p className="text-gray-400 mb-6">
            Complete some practice exercises to see your progress here.
          </p>
          <Link
            to="/practice"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Practicing
          </Link>
        </div>
      ) : (
        <>
          {/* Current level card */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                  Current Level · Ellinomatheia
                </p>
                <p className="text-gray-500 text-sm">{levelDesc.greek}</p>
              </div>
              <span className={`text-lg font-black px-4 py-2 rounded-full ${levelInfo.color}`}>
                {levelInfo.label}
              </span>
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-800">{levelDesc.description}</p>
              <p className="text-gray-500 text-sm mt-1">{levelDesc.canDo}</p>
            </div>

            {/* Level progression bar */}
            <div>
              <div className="flex gap-1.5 mb-1.5">
                {[1, 2, 3, 4, 5, 6].map((l) => (
                  <div
                    key={l}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      l < progress.currentLevel
                        ? 'bg-blue-500'
                        : l === progress.currentLevel
                          ? 'bg-blue-300'
                          : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>A1</span>
                <span>A2</span>
                <span>B1</span>
                <span>B2</span>
                <span>C1</span>
                <span>C2</span>
              </div>
            </div>

            {progress.currentLevel < 6 && (
              <p className="text-xs text-blue-500">
                {toNextLevel === 0
                  ? 'One more correct answer to level up!'
                  : `${toNextLevel} correct answer${toNextLevel > 1 ? 's' : ''} in a row to reach ${LEVEL_INFO[progress.currentLevel + 1].label}`}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4 text-center">
              <p className="text-3xl font-black text-blue-600">{accuracy}%</p>
              <p className="text-xs text-gray-500 mt-1">Overall Accuracy</p>
            </div>
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4 text-center">
              <p className="text-3xl font-black text-gray-800">{progress.totalAnswered}</p>
              <p className="text-xs text-gray-500 mt-1">Questions Answered</p>
            </div>
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4 text-center">
              <p className="text-3xl font-black text-green-600">{mastered.length}</p>
              <p className="text-xs text-gray-500 mt-1">Words Mastered</p>
            </div>
          </div>

          {/* Vocabulary breakdown */}
          {wordStats.length > 0 && (
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-700 mb-4">Vocabulary</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Mastered</span>
                      <span className="font-medium text-green-600">{mastered.length} words</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-green-400 rounded-full transition-all"
                        style={{
                          width: `${wordStats.length ? (mastered.length / wordStats.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-400 text-lg">~</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Learning</span>
                      <span className="font-medium text-blue-500">{learning.length} words</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-blue-300 rounded-full transition-all"
                        style={{
                          width: `${wordStats.length ? (learning.length / wordStats.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                {struggling.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 text-lg">✗</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Needs review</span>
                        <span className="font-medium text-red-500">{struggling.length} words</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-2 bg-red-300 rounded-full transition-all"
                          style={{
                            width: `${wordStats.length ? (struggling.length / wordStats.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Words needing review */}
              {struggling.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                    Focus on these
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {struggling.slice(0, 10).map((w) => (
                      <span
                        key={w.greek}
                        className="text-sm bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 rounded-full"
                        title={w.english}
                      >
                        {w.greek}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* About Ellinomatheia */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
            <h2 className="font-bold text-gray-700 mb-3">About the Ellinomatheia Scale</h2>
            <p className="text-sm text-gray-500 mb-4">
              Ellinomatheia is the official Greek language certification from the Greek Ministry of
              Education, aligned with the Common European Framework of Reference (CEFR). Your level
              here is estimated from your practice performance.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((l) => (
                <div
                  key={l}
                  className={`rounded-xl px-3 py-2 text-sm border transition-colors ${
                    l === progress.currentLevel
                      ? `${LEVEL_INFO[l].color} border-current font-semibold`
                      : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  <span className="font-bold">{LEVEL_INFO[l].label}</span>
                  <span className="ml-1.5">{LEVEL_DESCRIPTIONS[l].description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              to="/practice"
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow transition-colors"
            >
              Continue Practicing
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
