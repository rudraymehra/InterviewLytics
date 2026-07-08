import jwt from 'jsonwebtoken'

// The signing secret MUST be provided via the environment. A fallback is only
// tolerated for `next dev` (NODE_ENV === 'development'); any other environment
// without JWT_SECRET fails hard at module load instead of silently signing
// tokens with a publicly-known secret.
const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET
  if (secret && secret.trim().length > 0) return secret
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[jwt] JWT_SECRET is not set — using an INSECURE dev-only fallback. Set JWT_SECRET in .env.local.'
    )
    return 'dev-secret-change-me'
  }
  throw new Error('JWT_SECRET environment variable must be set')
})()

interface TokenPayload {
  id: string
  email: string
  role: 'candidate' | 'recruiter'
}

// Known limitation: tokens are not invalidated when a user changes their
// password — a previously issued token remains valid until it expires (7d).
// Proper invalidation would require a per-user token version (or denylist)
// checked in verifyUserToken.
export function signUserToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyUserToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}
