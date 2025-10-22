import fs from 'fs/promises'
import path from 'path'

type Role = 'candidate' | 'recruiter'

export interface StoredUser {
  id: string
  name: string
  email: string
  role: Role
  company?: string
  passwordHash: string
}

const dataDir = path.join(process.cwd(), 'data')
const usersFile = path.join(dataDir, 'users.json')

export async function ensureStore() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
    try {
      await fs.access(usersFile)
    } catch {
      await fs.writeFile(usersFile, '[]', 'utf-8')
    }
  } catch (_) {}
}

export async function readUsers(): Promise<StoredUser[]> {
  await ensureStore()
  try {
    const raw = await fs.readFile(usersFile, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as StoredUser[] : []
  } catch {
    return []
  }
}

export async function writeUsers(users: StoredUser[]): Promise<void> {
  await ensureStore()
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf-8')
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const all = await readUsers()
  return all.find(u => u.email.toLowerCase() === email.toLowerCase())
}

export async function findUserById(id: string): Promise<StoredUser | undefined> {
  const all = await readUsers()
  return all.find(u => u.id === id)
}


