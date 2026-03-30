import { createRootRoute, Outlet, Link, useRouterState, HeadContent, Scripts } from '@tanstack/react-router'
import appCss from '../styles/app.css?url'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/practice', label: 'Practice' },
  { to: '/conversation', label: 'Conversation' },
  { to: '/reading', label: 'Reading' },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/progress', label: 'Progress' },
]

function RootDocument() {
  const { location } = useRouterState()
  const pathname = location.pathname

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <HeadContent />
      </head>
      <body>
        <div className="min-h-screen bg-blue-50">
          <header className="bg-white shadow-sm">
            <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 flex-wrap">
              <span className="text-xl font-bold text-blue-700 mr-3">🇬🇷 Learn Greek</span>
              {NAV.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                    pathname === l.to
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="max-w-5xl mx-auto px-4 py-8">
            <Outlet />
          </main>
        </div>
        <Scripts />
      </body>
    </html>
  )
}

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootDocument,
})
