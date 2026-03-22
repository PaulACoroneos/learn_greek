// Shared TypeScript types for the Learn Greek app

export interface Flashcard {
  id: string
  greek: string
  english: string
  transliteration?: string
  example?: string
  addedAt: string
  reviewCount: number
  lastReviewed?: string
}

export interface WordBubble {
  id: string
  greek: string
  english: string
  selected: boolean
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  feedback?: string
  timestamp: string
}

export interface ReadingWord {
  id: string
  greek: string
  english?: string
  isKnown: boolean
}

export type AIMode = 'conversation' | 'grammar' | 'transliteration' | 'sentence-gen' | 'socratic'
