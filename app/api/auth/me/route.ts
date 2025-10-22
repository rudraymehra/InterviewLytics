import { NextResponse } from 'next/server'
import { verifyUserToken } from '@/lib/jwt'
import { findUserById } from '@/lib/userStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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
    const user = await findUserById(String(payload.id))
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, company: user.company }
    return NextResponse.json({ data: { user: safeUser } }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
}


