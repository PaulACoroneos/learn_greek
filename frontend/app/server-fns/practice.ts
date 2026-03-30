import { createServerFn } from '@tanstack/react-start'
import Anthropic from '@anthropic-ai/sdk'

export interface ExerciseWord {
  greek: string
  english: string
}

export interface ExerciseData {
  prompt: string
  correctWords: ExerciseWord[]
  distractors: ExerciseWord[]
}

interface GenerateExerciseInput {
  level: number
  recentlyMissed: string[]
}

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: 'A1 – Survival: single common words only – greetings (Καλημέρα, Γεια), numbers, colors, family members. 1–2 correct word bubbles.',
  2: 'A2 – Elementary: simple present-tense phrases – I want/have/am, food, weather. 2–3 correct word bubbles.',
  3: 'B1 – Intermediate: full simple sentences – present & basic past tense (πήγα, είδα), places, transport. 3–4 correct word bubbles including articles.',
  4: 'B2 – Upper-Intermediate: longer sentences – varied tenses, adjective gender agreement, prepositions. 4–6 correct word bubbles.',
  5: 'C1 – Advanced: complex structures – subjunctive (να), conditionals, idiomatic usage. 5–7 correct word bubbles.',
  6: 'C2 – Mastery: near-native – idioms, nuanced vocabulary, complex grammar. 6–8 correct word bubbles.',
}

export const generateWordBubbleExercise = createServerFn({ method: 'POST' })
  .inputValidator((data: GenerateExerciseInput) => data)
  .handler(async ({ data }) => {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const missedHint =
      data.recentlyMissed.length > 0
        ? `\nThe student recently struggled with: ${data.recentlyMissed.join(', ')}. Incorporate these naturally if possible.`
        : ''

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      system: `You are a Modern Greek language teacher at a school for English-speaking students.
Create a word-bubble exercise: the student sees an English phrase and selects the correct Greek words from a shuffled set of bubbles.

Level: ${LEVEL_DESCRIPTIONS[data.level]}${missedHint}

Rules:
- Include articles (ο/η/το, τον/την/το, στον/στην/στο) as SEPARATE bubbles when they are part of the answer
- Distractors must be plausible – same topic area, similar-looking words, or common mix-ups
- Pick a FRESH everyday topic each time: café, weather, family, shopping, travel, sport, school, food, home, transport, health
- Never repeat the exact same sentence twice
- Total bubbles (correct + distractors) should be between 5 and 9

Respond ONLY with valid JSON – no markdown, no extra keys:
{
  "prompt": "English phrase or sentence to translate",
  "correctWords": [{"greek": "word", "english": "meaning"}],
  "distractors": [{"greek": "word", "english": "meaning"}]
}`,
      messages: [
        {
          role: 'user',
          content: `Generate a level ${data.level} word-bubble exercise on a fresh topic.`,
        },
      ],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    try {
      return JSON.parse(cleaned) as ExerciseData
    } catch {
      throw new Error('Failed to parse exercise from AI response')
    }
  })
