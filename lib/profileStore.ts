import { getSupabaseAdmin } from './supabaseAdmin'

export const RESUME_BUCKET = 'profile-resumes'
export const AVATAR_BUCKET = 'profile-avatars'

interface ProfileRow {
  user_id: string
  phone?: string | null
  location?: string | null
  bio?: string | null
  resume_path?: string | null
  resume_name?: string | null
  avatar_path?: string | null
  avatar_name?: string | null
  created_at?: string
  updated_at?: string
}

export interface ProfileResponse {
  phone?: string
  location?: string
  bio?: string
  resumeUrl?: string
  resumeName?: string
  avatarUrl?: string
  avatarName?: string
  updatedAt?: string
}

export async function getProfile(userId: string): Promise<ProfileResponse> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from<ProfileRow>('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Unable to fetch profile: ${error.message}`)
  }

  if (!data) {
    return {}
  }

  const response: ProfileResponse = {
    phone: data.phone ?? undefined,
    location: data.location ?? undefined,
    bio: data.bio ?? undefined,
    resumeName: data.resume_name ?? undefined,
    avatarName: data.avatar_name ?? undefined,
    updatedAt: data.updated_at ?? undefined
  }

  if (data.resume_path) {
    const { data: publicUrl } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(data.resume_path)
    response.resumeUrl = publicUrl.publicUrl
  }

  if (data.avatar_path) {
    const { data: publicUrl } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(data.avatar_path)
    response.avatarUrl = publicUrl.publicUrl
  }

  return response
}

export async function upsertProfile(userId: string, payload: Partial<Omit<ProfileRow, 'user_id'>>): Promise<void> {
  const supabase = getSupabaseAdmin()
  const filteredPayload: Record<string, any> = {}
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) {
      filteredPayload[key] = value
    }
  })

  const updatePayload = {
    user_id: userId,
    ...filteredPayload,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(updatePayload, { onConflict: 'user_id' })

  if (error) {
    throw new Error(`Unable to update profile: ${error.message}`)
  }
}

export async function getProfileRow(userId: string): Promise<ProfileRow | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from<ProfileRow>('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Unable to load profile record: ${error.message}`)
  }

  return data ?? null
}

export async function saveFileToBucket(params: {
  bucket: typeof RESUME_BUCKET | typeof AVATAR_BUCKET
  path: string
  file: Uint8Array
  contentType: string
}): Promise<string> {
  const supabase = getSupabaseAdmin()
  const { bucket, path, file, contentType } = params

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: true })

  if (error) {
    throw new Error(`Unable to upload file: ${error.message}`)
  }

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl.publicUrl
}

export async function removeFileFromBucket(bucket: string, path?: string | null): Promise<void> {
  if (!path) return
  const supabase = getSupabaseAdmin()
  await supabase.storage.from(bucket).remove([path])
}


