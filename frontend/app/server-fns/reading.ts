import { createServerFn } from '@tanstack/react-start'
import Anthropic from '@anthropic-ai/sdk'

export type ReadingLevel = 'beginner' | 'intermediate' | 'advanced'

interface GeneratePassageInput {
  level: ReadingLevel
}

export interface PassageData {
  title: string
  greekText: string
  englishSummary: string
}

interface ExplainWordInput {
  passage: string
  word: string
}

export interface WordExplanation {
  explanation: string
  grammarNote: string
}

const LEVEL_DESCRIPTIONS: Record<ReadingLevel, string> = {
  beginner: 'A1-A2: very short (2-4 sentences), everyday vocabulary, present tense only',
  intermediate: 'B1: 4-6 sentences, varied vocabulary, present and past tenses',
  advanced: 'B2: 6-8 sentences, richer vocabulary, varied tenses and structures',
}

export const generateReadingPassage = createServerFn({ method: 'POST' })
  .inputValidator((data: GeneratePassageInput) => data)
  .handler(async ({ data }) => {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      system: [
        {
          type: 'text',
          text: `You are a Modern Greek language teacher creating reading passages for learners.
Generate a short, natural Modern Greek passage at the requested level.
Respond ONLY with valid JSON in exactly this format, no extra keys:
{
  "title": "Short descriptive English title",
  "greekText": "The complete Greek passage as a single string",
  "englishSummary": "1-2 sentence English summary"
}`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Level: ${LEVEL_DESCRIPTIONS[data.level]}. Topic: pick a natural everyday scene (café, family, market, weather, travel, sport, etc.).`,
        },
      ],
    })
    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    try {
      return JSON.parse(cleaned) as PassageData
    } catch {
      throw new Error('Failed to parse passage data from AI response')
    }
  })

export const explainWordInContext = createServerFn({ method: 'POST' })
  .inputValidator((data: ExplainWordInput) => data)
  .handler(async ({ data }) => {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 256,
      system: [
        {
          type: 'text',
          text: `You are a Modern Greek teacher explaining vocabulary in context.
Given a Greek word and the passage it appears in, provide:
1. What the word means in THIS specific context (not just a dictionary gloss)
2. A brief grammar note (case, verb form, tense, etc.) if useful
Respond ONLY with valid JSON: {"explanation": "...", "grammarNote": "..."}`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Passage: "${data.passage}"\n\nExplain the word: "${data.word}"`,
        },
      ],
    })
    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    try {
      return JSON.parse(cleaned) as WordExplanation
    } catch {
      throw new Error('Failed to parse word explanation from AI response')
    }
  })
