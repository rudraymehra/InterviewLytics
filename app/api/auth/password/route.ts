import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { verifyUserToken } from '@/lib/jwt'
import { findUserById, updateUserPassword } from '@/lib/userStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
  try {
    const auth = request.headers.get('authorization') || request.headers.get('Authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyUserToken(token)
    if (!payload?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({})) as any
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Current and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 8 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number' }, { status: 400 })
    }

    const user = await findUserById(payload.id)
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await updateUserPassword(user.id, passwordHash)

    return NextResponse.json({ message: 'Password updated' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: 'Password update failed' }, { status: 500 })
  }
}


