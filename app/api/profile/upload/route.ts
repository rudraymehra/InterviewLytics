import { NextResponse } from 'next/server'
import { verifyUserToken } from '@/lib/jwt'
import { findUserById } from '@/lib/userStore'
import { getProfileRow, removeFileFromBucket, saveFileToBucket, upsertProfile, AVATAR_BUCKET, RESUME_BUCKET } from '@/lib/profileStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp']

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

export async function POST(request: Request) {
  try {
    const authResult = await requireUser(request)
    if (authResult instanceof NextResponse) return authResult

    const { tokenPayload } = authResult
    const formData = await request.formData()
    const file = formData.get('file')
    const type = String(formData.get('type') || '')

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'File is required' }, { status: 400 })
    }

    if (type !== 'resume' && type !== 'avatar') {
      return NextResponse.json({ message: 'Invalid upload type' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    const contentType = file.type || 'application/octet-stream'

    if (type === 'resume' && !ALLOWED_RESUME_TYPES.includes(contentType)) {
      return NextResponse.json({ message: 'Unsupported resume format' }, { status: 400 })
    }

    if (type === 'avatar' && !ALLOWED_AVATAR_TYPES.includes(contentType)) {
      return NextResponse.json({ message: 'Unsupported image format' }, { status: 400 })
    }

    const extension = file.name.split('.').pop() || 'dat'
    const filename = `${type}-${Date.now()}.${extension}`
    const path = `${tokenPayload.id}/${filename}`

    const profileRow = await getProfileRow(tokenPayload.id)

    if (type === 'resume' && profileRow?.resume_path) {
      await removeFileFromBucket(RESUME_BUCKET, profileRow.resume_path)
    }

    if (type === 'avatar' && profileRow?.avatar_path) {
      await removeFileFromBucket(AVATAR_BUCKET, profileRow.avatar_path)
    }

    const bucket = type === 'resume' ? RESUME_BUCKET : AVATAR_BUCKET
    const publicUrl = await saveFileToBucket({ bucket, path, file: buffer, contentType })

    if (type === 'resume') {
      await upsertProfile(tokenPayload.id, {
        resume_path: path,
        resume_name: file.name
      })
    } else {
      await upsertProfile(tokenPayload.id, {
        avatar_path: path,
        avatar_name: file.name
      })
    }

    return NextResponse.json({
      data: {
        url: publicUrl,
        name: file.name,
        type
      }
    })
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : 'Failed to upload file'
    return NextResponse.json({ message }, { status: 500 })
  }
}




