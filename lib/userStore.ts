import { getSupabaseAdmin } from './supabaseAdmin'

type Role = 'candidate' | 'recruiter'

export interface StoredUser {
  id: string
  name: string
  email: string
  role: Role
  company?: string
  passwordHash: string
}

const TABLE = 'users'

function mapRow(row: any | null | undefined): StoredUser | undefined {
  if (!row) return undefined
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    company: row.company ?? undefined,
    passwordHash: row.password_hash
  }
}

export async function readUsers(): Promise<StoredUser[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Unable to read users: ${error.message}`)
  }

  return (data ?? []).map(mapRow).filter(Boolean) as StoredUser[]
}

export async function createUser(user: StoredUser): Promise<void> {
  const supabase = getSupabaseAdmin()
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email.toLowerCase(),
    role: user.role,
    company: user.company ?? null,
    password_hash: user.passwordHash
  }

  const { error } = await supabase.from(TABLE).insert(payload)
  if (error) {
    throw new Error(`Unable to create user: ${error.message}`)
  }
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Unable to find user by email: ${error.message}`)
  }

  return mapRow(data)
}

export async function findUserById(id: string): Promise<StoredUser | undefined> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Unable to find user by id: ${error.message}`)
  }

  return mapRow(data)
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from(TABLE)
    .update({ password_hash: passwordHash })
    .eq('id', id)

  if (error) {
    throw new Error(`Unable to update password: ${error.message}`)
  }
}

export async function updateUserBasicInfo(id: string, updates: { name?: string; company?: string | null }): Promise<void> {
  const supabase = getSupabaseAdmin()
  const payload: Record<string, any> = {}
  if (typeof updates.name === 'string') {
    payload.name = updates.name
  }
  if (updates.company !== undefined) {
    payload.company = updates.company
  }

  if (Object.keys(payload).length === 0) {
    return
  }

  const { error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)

  if (error) {
    throw new Error(`Unable to update user: ${error.message}`)
  }
}

