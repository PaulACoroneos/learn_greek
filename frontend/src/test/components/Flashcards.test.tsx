import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Flashcards from '../../components/Flashcards/Flashcards'
import type { Flashcard } from '../../types'

const CARDS: Flashcard[] = [
  { id: '1', greek: 'Γεια', english: 'Hello', transliteration: 'Yia', addedAt: '2024-01-01T00:00:00Z', reviewCount: 0 },
  { id: '2', greek: 'Ευχαριστώ', english: 'Thank you', addedAt: '2024-01-02T00:00:00Z', reviewCount: 3 },
]

const PROPS = {
  flashcards: CARDS,
  onRemove: vi.fn(),
  onMarkReviewed: vi.fn(),
  onClearAll: vi.fn(),
}

describe('Flashcards', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows empty state when no cards', () => {
    render(<Flashcards {...PROPS} flashcards={[]} />)
    expect(screen.getByText('No flashcards yet')).toBeInTheDocument()
  })

  it('lists all flashcards', () => {
    render(<Flashcards {...PROPS} />)
    expect(screen.getByText('Γεια')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Ευχαριστώ')).toBeInTheDocument()
    expect(screen.getByText('Thank you')).toBeInTheDocument()
  })

  it('shows correct card count', () => {
    render(<Flashcards {...PROPS} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('calls onRemove when remove button clicked', () => {
    render(<Flashcards {...PROPS} />)
    fireEvent.click(screen.getByLabelText('Remove Γεια'))
    expect(PROPS.onRemove).toHaveBeenCalledWith('1')
  })

  it('calls onClearAll when Clear All clicked', () => {
    render(<Flashcards {...PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear All' }))
    expect(PROPS.onClearAll).toHaveBeenCalled()
  })

  it('enters review mode and shows first card', () => {
    render(<Flashcards {...PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Review All' }))
    expect(screen.getByText('Γεια')).toBeInTheDocument()
    expect(screen.getByText('Click to reveal translation')).toBeInTheDocument()
  })

  it('flips card to show translation', () => {
    render(<Flashcards {...PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Review All' }))
    const card = screen.getByRole('button', { name: /Show English translation/ })
    fireEvent.click(card)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('calls onMarkReviewed and advances card', () => {
    render(<Flashcards {...PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Review All' }))
    fireEvent.click(screen.getByRole('button', { name: '✓ Got it' }))
    expect(PROPS.onMarkReviewed).toHaveBeenCalledWith('1')
    expect(screen.getByText('Ευχαριστώ')).toBeInTheDocument()
  })
})
