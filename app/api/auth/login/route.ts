import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { findUserByEmail } from '@/lib/userStore'
import { signUserToken } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as any
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    const role = body?.role === 'recruiter' || body?.role === 'candidate' ? body.role : undefined

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    // Use generic message to avoid leaking whether the email exists
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    // Optional role check: if client specified a portal role, enforce it.
    // Credentials are valid at this point, so tell the user which portal to use.
    if (role && user.role !== role) {
      return NextResponse.json(
        { message: `This account is a ${user.role} account — use the ${user.role} portal` },
        { status: 403 }
      )
    }

    const token = signUserToken({ id: user.id, email: user.email, role: user.role })
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, company: user.company }

    return NextResponse.json({ data: { user: safeUser, token } }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: 'Login failed' }, { status: 500 })
  }
}


