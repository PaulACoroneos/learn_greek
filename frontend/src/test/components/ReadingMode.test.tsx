import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReadingMode from '../../../app/components/ReadingMode/ReadingMode'
import type { ReadingWord } from '../../../app/types'

const WORDS: ReadingWord[] = [
  { id: 'w1', greek: 'Καλημέρα!', english: 'Good morning!', isKnown: false },
  { id: 'w2', greek: 'Θέλω', english: 'I want', isKnown: false },
  { id: 'w3', greek: 'νερό', english: 'water', isKnown: true },
]

const PROPS = { title: 'Test Passage', words: WORDS, onAddFlashcard: vi.fn().mockReturnValue(true) }

describe('ReadingMode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the title', () => {
    render(<ReadingMode {...PROPS} />)
    expect(screen.getByText('Test Passage')).toBeInTheDocument()
  })

  it('renders all words', () => {
    render(<ReadingMode {...PROPS} />)
    expect(screen.getByText('Καλημέρα!')).toBeInTheDocument()
    expect(screen.getByText('Θέλω')).toBeInTheDocument()
    expect(screen.getByText('νερό')).toBeInTheDocument()
  })

  it('opens modal when word is clicked', () => {
    render(<ReadingMode {...PROPS} />)
    fireEvent.click(screen.getByLabelText('Word: Καλημέρα!'))
    expect(screen.getByText('Good morning!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add to Flashcards' })).toBeInTheDocument()
  })

  it('calls onAddFlashcard when Add to Flashcards clicked', () => {
    render(<ReadingMode {...PROPS} />)
    fireEvent.click(screen.getByLabelText('Word: Καλημέρα!'))
    fireEvent.click(screen.getByRole('button', { name: '+ Add to Flashcards' }))
    expect(PROPS.onAddFlashcard).toHaveBeenCalledWith('Καλημέρα!', 'Good morning!')
  })

  it('closes modal when Close button clicked', () => {
    render(<ReadingMode {...PROPS} />)
    fireEvent.click(screen.getByLabelText('Word: Καλημέρα!'))
    fireEvent.click(screen.getByLabelText('Close'))
    expect(screen.queryByRole('button', { name: '+ Add to Flashcards' })).not.toBeInTheDocument()
  })

  it('closes modal when "I know this" clicked', () => {
    render(<ReadingMode {...PROPS} />)
    fireEvent.click(screen.getByLabelText('Word: Καλημέρα!'))
    fireEvent.click(screen.getByRole('button', { name: 'I know this' }))
    expect(screen.queryByRole('button', { name: '+ Add to Flashcards' })).not.toBeInTheDocument()
  })
})
