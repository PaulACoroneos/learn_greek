import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const FEATURES = [
  {
    to: '/practice',
    icon: '🗣️',
    title: 'Word Practice',
    desc: 'Select word bubbles or type answers to practice Greek vocabulary.',
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
  },
  {
    to: '/conversation',
    icon: '💬',
    title: 'Conversation',
    desc: 'Simulate real Greek conversations and get instant feedback.',
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
  },
  {
    to: '/reading',
    icon: '📖',
    title: 'Reading Mode',
    desc: 'Read Greek texts. Click unknown words to save them as flashcards.',
    color: 'bg-green-50 hover:bg-green-100 border-green-200',
  },
  {
    to: '/flashcards',
    icon: '🃏',
    title: 'Flashcards',
    desc: 'Review words you missed or saved. Flip cards to test your memory.',
    color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
  },
]

function HomePage() {
  return (
    <div className="space-y-10">
      <div className="text-center space-y-4 py-6">
        <h1 className="text-5xl font-extrabold text-blue-700">Μάθε Ελληνικά</h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto">
          Your personal Greek language learning companion. Practice words, have conversations, and
          build your vocabulary — one word at a time.
        </p>
        <div className="flex gap-4 justify-center flex-wrap pt-2">
          <Link
            to="/practice"
            className="px-7 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 shadow-md"
          >
            Start Practicing
          </Link>
          <Link
            to="/flashcards"
            className="px-7 py-3 bg-white text-blue-600 rounded-full text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 shadow"
          >
            My Flashcards
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {FEATURES.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className={`rounded-2xl p-6 border transition-colors ${f.color} block`}
          >
            <div className="text-4xl mb-3">{f.icon}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{f.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-700 mb-3">Quick Tips 💡</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>🔵 Blue words in Reading Mode can be clicked to add to your flashcards</li>
          <li>🟢 Words you already know will appear in green</li>
          <li>🃏 Review your flashcards regularly for best retention</li>
          <li>💬 Practice conversation to build real-world confidence</li>
        </ul>
      </div>
    </div>
  )
}
