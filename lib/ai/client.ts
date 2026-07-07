// Anthropic client singleton + model configuration.

import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

/**
 * Lazy singleton Anthropic client. `new Anthropic()` reads
 * ANTHROPIC_API_KEY from the environment automatically.
 */
export function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic()
  }
  return _client
}

export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8'

export function aiEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}
