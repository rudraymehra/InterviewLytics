import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Lightweight in-memory per-user rate limit (paid upstream APIs). Fixed
// 60-second windows, capped entries with periodic cleanup of stale windows.
const RATE_LIMIT_MAX = 30
const RATE_WINDOW_MS = 60_000
const rateBuckets = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  if (rateBuckets.size > 1_000) {
    rateBuckets.forEach((bucket, key) => {
      if (now - bucket.windowStart > RATE_WINDOW_MS) rateBuckets.delete(key)
    })
  }
  const bucket = rateBuckets.get(userId)
  if (!bucket || now - bucket.windowStart > RATE_WINDOW_MS) {
    rateBuckets.set(userId, { count: 1, windowStart: now })
    return false
  }
  bucket.count += 1
  return bucket.count > RATE_LIMIT_MAX
}

/**
 * POST /api/tts — synthesize speech for interview questions.
 * Body: { text }. Returns audio/mpeg.
 * Provider order: ElevenLabs (ELEVENLABS_API_KEY) → OpenAI (OPENAI_API_KEY).
 * With neither configured, returns 404 and the client falls back to the
 * browser's built-in speechSynthesis.
 */
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)

    if (isRateLimited(user.id)) {
      return NextResponse.json(
        { error: 'Too many speech requests — please slow down' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 2000) : ''
    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const elevenKey = process.env.ELEVENLABS_API_KEY
    if (elevenKey) {
      // Wrapped so a rejected fetch (network/DNS) falls through to OpenAI.
      try {
        // George — premade voice available to free-tier API keys (library voices are paid-only)
        const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb'
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
          {
            method: 'POST',
            headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2_5',
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
          }
        )
        if (res.ok) {
          return new NextResponse(await res.arrayBuffer(), {
            headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
          })
        }
        console.warn('[tts] ElevenLabs failed:', res.status, await res.text().catch(() => ''))
      } catch (elevenError) {
        console.warn('[tts] ElevenLabs request threw:', elevenError)
      }
    }

    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      // Wrapped so a rejected fetch falls through to the 404 (client then uses
      // browser speechSynthesis) instead of a 500.
      try {
        const res = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
            voice: process.env.OPENAI_TTS_VOICE || 'nova',
            input: text,
            response_format: 'mp3',
          }),
        })
        if (res.ok) {
          return new NextResponse(await res.arrayBuffer(), {
            headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
          })
        }
        console.warn('[tts] OpenAI failed:', res.status, await res.text().catch(() => ''))
      } catch (openaiError) {
        console.warn('[tts] OpenAI request threw:', openaiError)
      }
    }

    return NextResponse.json({ error: 'no-tts-provider' }, { status: 404 })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('TTS error:', error)
    return NextResponse.json({ error: 'Speech synthesis failed' }, { status: 500 })
  }
}
