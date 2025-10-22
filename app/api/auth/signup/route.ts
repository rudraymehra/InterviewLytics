import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { writeUsers, readUsers, findUserByEmail } from '@/lib/userStore'
import { signUserToken } from '@/lib/jwt'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as any
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    const role = body?.role === 'recruiter' || body?.role === 'candidate' ? body.role : 'candidate'
    const company = typeof body?.company === 'string' ? body.company : undefined

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 })
    }

    const existing = await findUserByEmail(email)
    if (existing) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const id = uuidv4()

    const all = await readUsers()
    const newUser = { id, name, email, role, company, passwordHash }
    all.push(newUser)
    await writeUsers(all)

    const token = signUserToken({ id, email, role })
    const safeUser = { id, name, email, role, company }

    return NextResponse.json({ data: { user: safeUser, token } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Signup failed' }, { status: 500 })
  }
}


