import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import PracticePage from './pages/PracticePage'
import FlashcardsPage from './pages/FlashcardsPage'
import ConversationPage from './pages/ConversationPage'
import ReadingPage from './pages/ReadingPage'

export default function App() {
  return (
    <BrowserRouter basename="/learn_greek">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/conversation" element={<ConversationPage />} />
          <Route path="/reading" element={<ReadingPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
