import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import WordBubbles from '../../../app/components/WordBubbles/WordBubbles'

const PROPS = {
  prompt: 'Good morning',
  promptTranslation: 'Select the correct Greek word',
  wordOptions: [
    { id: 'w1', greek: 'Καλημέρα', english: 'Good morning' },
    { id: 'w2', greek: 'Καληνύχτα', english: 'Good night' },
    { id: 'w3', greek: 'Γεια', english: 'Hello' },
  ],
  correctWords: ['Καλημέρα'],
  onComplete: vi.fn(),
}

describe('WordBubbles', () => {
  beforeEach(() => PROPS.onComplete.mockClear())

  it('renders the prompt', () => {
    render(<WordBubbles {...PROPS} />)
    expect(screen.getByText('Good morning')).toBeInTheDocument()
  })

  it('renders all word bubbles', () => {
    render(<WordBubbles {...PROPS} />)
    expect(screen.getByText('Καλημέρα')).toBeInTheDocument()
    expect(screen.getByText('Καληνύχτα')).toBeInTheDocument()
    expect(screen.getByText('Γεια')).toBeInTheDocument()
  })

  it('moves word to tray on click and returns it on tray click', () => {
    render(<WordBubbles {...PROPS} />)
    expect(screen.getByText('Tap words below to build the sentence…')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Καλημέρα'))
    // word should now be in tray (placeholder gone)
    expect(screen.queryByText('Tap words below to build the sentence…')).not.toBeInTheDocument()
    // click tray word to return it
    fireEvent.click(screen.getByText('Καλημέρα'))
    expect(screen.getByText('Tap words below to build the sentence…')).toBeInTheDocument()
  })

  it('calls onComplete(true, []) for correct selection', () => {
    render(<WordBubbles {...PROPS} />)
    fireEvent.click(screen.getByText('Καλημέρα'))
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(PROPS.onComplete).toHaveBeenCalledWith(true, [])
  })

  it('calls onComplete(false, missed) for wrong selection', () => {
    render(<WordBubbles {...PROPS} />)
    fireEvent.click(screen.getByText('Γεια'))
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(PROPS.onComplete).toHaveBeenCalledWith(false, ['Καλημέρα'])
  })

  it('shows ✅ Correct! feedback', () => {
    render(<WordBubbles {...PROPS} />)
    fireEvent.click(screen.getByText('Καλημέρα'))
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(screen.getByText('✅ Correct!')).toBeInTheDocument()
  })

  it('shows ❌ Not quite feedback', () => {
    render(<WordBubbles {...PROPS} />)
    fireEvent.click(screen.getByText('Γεια'))
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(screen.getByText('❌ Not quite')).toBeInTheDocument()
  })

  it('disables bubbles after submission', () => {
    render(<WordBubbles {...PROPS} />)
    fireEvent.click(screen.getByText('Καλημέρα'))
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    // tray button should be disabled after submission
    const trayBtn = screen.getByText('Καλημέρα').closest('button')
    expect(trayBtn).toBeDisabled()
  })

  it('hides Submit button after submission', () => {
    render(<WordBubbles {...PROPS} />)
    fireEvent.click(screen.getByText('Καλημέρα'))
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument()
  })
})
