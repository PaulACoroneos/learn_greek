import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FreeTyping from '../../components/FreeTyping/FreeTyping'

const PROPS = {
  prompt: 'Hello',
  promptTranslation: 'Type the Greek translation',
  expectedAnswer: 'Γεια',
  hint: 'Starts with Γ',
  onComplete: vi.fn(),
}

describe('FreeTyping', () => {
  beforeEach(() => PROPS.onComplete.mockClear())

  it('renders the prompt', () => {
    render(<FreeTyping {...PROPS} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders the input field', () => {
    render(<FreeTyping {...PROPS} />)
    expect(screen.getByPlaceholderText('Type your answer in Greek...')).toBeInTheDocument()
  })

  it('Check button is disabled when input is empty', () => {
    render(<FreeTyping {...PROPS} />)
    expect(screen.getByRole('button', { name: 'Check' })).toBeDisabled()
  })

  it('enables Check when text is typed', async () => {
    const user = userEvent.setup()
    render(<FreeTyping {...PROPS} />)
    await user.type(screen.getByPlaceholderText('Type your answer in Greek...'), 'Γεια')
    expect(screen.getByRole('button', { name: 'Check' })).not.toBeDisabled()
  })

  it('shows ✅ Correct! for correct answer', async () => {
    const user = userEvent.setup()
    render(<FreeTyping {...PROPS} />)
    await user.type(screen.getByPlaceholderText('Type your answer in Greek...'), 'Γεια')
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByText('✅ Correct!')).toBeInTheDocument()
    expect(PROPS.onComplete).toHaveBeenCalledWith(true, 'Γεια')
  })

  it('shows ❌ Not quite for wrong answer', async () => {
    const user = userEvent.setup()
    render(<FreeTyping {...PROPS} />)
    await user.type(screen.getByPlaceholderText('Type your answer in Greek...'), 'wrong')
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByText('❌ Not quite')).toBeInTheDocument()
    expect(PROPS.onComplete).toHaveBeenCalledWith(false, 'wrong')
  })

  it('toggles hint visibility', async () => {
    const user = userEvent.setup()
    render(<FreeTyping {...PROPS} />)
    await user.click(screen.getByRole('button', { name: 'Show hint' }))
    expect(screen.getByText(/Starts with Γ/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Hide hint' }))
    expect(screen.queryByText(/Starts with Γ/)).not.toBeInTheDocument()
  })

  it('is case and whitespace insensitive', async () => {
    const user = userEvent.setup()
    render(<FreeTyping {...PROPS} />)
    await user.type(screen.getByPlaceholderText('Type your answer in Greek...'), '  γεια  ')
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByText('✅ Correct!')).toBeInTheDocument()
  })

  it('disables input after submission', async () => {
    const user = userEvent.setup()
    render(<FreeTyping {...PROPS} />)
    await user.type(screen.getByPlaceholderText('Type your answer in Greek...'), 'Γεια')
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByPlaceholderText('Type your answer in Greek...')).toBeDisabled()
  })
})
