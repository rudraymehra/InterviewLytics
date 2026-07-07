// Centralized request authentication for API routes.
import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken } from './jwt'

export interface AuthPayload {
  id: string
  email: string
  role: 'candidate' | 'recruiter'
}

export class ApiAuthError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/**
 * Authenticate a request from its Bearer token.
 * Throws ApiAuthError (401/403) — convert with `handleAuthError` in the route's catch.
 */
export function requireAuth(request: NextRequest, role?: 'candidate' | 'recruiter'): AuthPayload {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    throw new ApiAuthError('Authentication required', 401)
  }

  const payload = verifyUserToken(token)
  if (!payload) {
    throw new ApiAuthError('Invalid or expired token', 401)
  }

  if (role && payload.role !== role) {
    throw new ApiAuthError(`This action requires a ${role} account`, 403)
  }

  return payload
}

/** Convert a thrown ApiAuthError into a JSON response; rethrow anything else. */
export function handleAuthError(error: unknown): NextResponse | null {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  return null
}
