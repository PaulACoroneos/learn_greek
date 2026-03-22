import { createServerFn } from '@tanstack/react-start'
import Anthropic from '@anthropic-ai/sdk'
import type { AIMode } from '../types'

interface ChatInput {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  mode: AIMode
  knownWords?: string[]
}

function buildSystemPrompt(mode: AIMode, knownWords?: string[]): string {
  switch (mode) {
    case 'conversation':
      return `You are a Greek language teacher conducting a Greek conversation practice session. Respond in Greek with English translation in parentheses. After each response, provide a "💡 Grammar note:" line explaining any relevant grammatical point (case, declension, verb aspect, etc.). Keep responses concise and encouraging.`

    case 'grammar':
      return `You are a Greek grammar expert. When given Greek text or a question, identify and explain grammatical features clearly: nominative/accusative/genitive/dative cases, verb aspect (perfective/imperfective), tense, declension class, and agreement rules. Use examples to illustrate your explanations.`

    case 'transliteration':
      return `You are a Greek script specialist. Convert between Greek script and Latin transliteration:
- When given Greek script: provide the Latin transliteration and a pronunciation guide with stress marks.
- When given Latin transliteration: provide the Greek script and explain any ambiguous letter mappings (e.g., theta→θ, chi→χ, eta→η vs epsilon→ε).
Always explain the phonetic value of special Greek letters.`

    case 'sentence-gen':
      return `You are a Greek language teacher who generates simple Greek sentences. ${knownWords && knownWords.length > 0 ? `Use ONLY these vocabulary words the student knows: ${knownWords.join(', ')}. ` : ''}Generate simple, grammatically correct Greek sentences. For each sentence: show the Greek, the English translation, and label each word with its grammatical role (subject, verb, object, adjective, etc.).`

    case 'socratic':
      return `You are Socrates teaching Greek through questioning. Your method:
1. Give the student a target Greek word or phrase and ask them to use it in a Greek sentence.
2. When they reply with a sentence, evaluate it: praise what was grammatically correct, then gently correct any errors by explaining the correct form in terms of grammar rules (case, declension, aspect).
3. Always ask a follow-up question to keep the dialogue going.
Keep responses encouraging and educational.`

    default:
      return `You are a helpful Greek language teacher.`
  }
}

export const sendChatMessage = createServerFn({ method: 'POST' })
  .inputValidator((data: ChatInput) => data)
  .handler(async ({ data }) => {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const systemPrompt = buildSystemPrompt(data.mode, data.knownWords)
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: data.messages,
    })
    const block = response.content[0]
    return { content: block.type === 'text' ? block.text : '' }
  })
