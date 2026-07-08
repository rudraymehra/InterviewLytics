import { NextResponse } from 'next/server'
import { verifyUserToken } from '@/lib/jwt'
import { findUserById, updateUserBasicInfo } from '@/lib/userStore'
import { getProfile, upsertProfile } from '@/lib/profileStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function requireUser(request: Request) {
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

  return { tokenPayload: payload, user }
}

export async function GET(request: Request) {
  try {
    const authResult = await requireUser(request)
    if (authResult instanceof NextResponse) return authResult

    const { tokenPayload, user } = authResult
    const profile = await getProfile(tokenPayload.id)

    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company ?? undefined
        },
        profile
      }
    })
  } catch (error) {
    console.error('Failed to load profile:', error)
    return NextResponse.json({ message: 'Failed to load profile' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const authResult = await requireUser(request)
    if (authResult instanceof NextResponse) return authResult

    const { tokenPayload, user } = authResult
    const body = await request.json().catch(() => ({})) as Record<string, any>

    const name = typeof body?.name === 'string' ? body.name.trim() : undefined
    const company = typeof body?.company === 'string' ? body.company.trim() : undefined
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : undefined
    const location = typeof body?.location === 'string' ? body.location.trim() : undefined
    const bio = typeof body?.bio === 'string' ? body.bio.trim() : undefined

    if (name !== undefined && !name) {
      return NextResponse.json({ message: 'Name cannot be empty' }, { status: 400 })
    }

    if (phone?.length && phone.length > 50) {
      return NextResponse.json({ message: 'Phone number is too long' }, { status: 400 })
    }

    if (location?.length && location.length > 120) {
      return NextResponse.json({ message: 'Location is too long' }, { status: 400 })
    }

    if (bio?.length && bio.length > 500) {
      return NextResponse.json({ message: 'Bio must be under 500 characters' }, { status: 400 })
    }

    await Promise.all([
      updateUserBasicInfo(tokenPayload.id, {
        name,
        company: company !== undefined ? company : user.company ?? null
      }),
      upsertProfile(tokenPayload.id, {
        phone,
        location,
        bio
      })
    ])

    const profile = await getProfile(tokenPayload.id)
    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          name: name ?? user.name,
          email: user.email,
          role: user.role,
          company: company ?? user.company ?? undefined
        },
        profile
      }
    })
  } catch (error) {
    // Log details server-side; return a generic message to the client.
    console.error('Failed to update profile:', error)
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 })
  }
}




