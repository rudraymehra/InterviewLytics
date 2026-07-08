import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/tts — synthesize speech for interview questions.
 * Body: { text }. Returns audio/mpeg.
 * Provider order: ElevenLabs (ELEVENLABS_API_KEY) → OpenAI (OPENAI_API_KEY).
 * With neither configured, returns 404 and the client falls back to the
 * browser's built-in speechSynthesis.
 */
export async function POST(request: NextRequest) {
  try {
    requireAuth(request)

    const body = await request.json().catch(() => ({}))
    const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 2000) : ''
    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const elevenKey = process.env.ELEVENLABS_API_KEY
    if (elevenKey) {
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
    }

    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
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
    }

    return NextResponse.json({ error: 'no-tts-provider' }, { status: 404 })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('TTS error:', error)
    return NextResponse.json({ error: 'Speech synthesis failed' }, { status: 500 })
  }
}
