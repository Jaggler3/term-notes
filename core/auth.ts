import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sql from '../lib/sql'
import { User } from '../lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  username: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function createUser(username: string, email: string, password: string): Promise<User> {
  const passwordHash = await hashPassword(password)
  
  const [user] = await sql`
    INSERT INTO users (username, email, password_hash)
    VALUES (${username}, ${email}, ${passwordHash})
    RETURNING *
  `
  
  return user as User
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const [user] = await sql`
    SELECT * FROM users WHERE username = ${username}
  `
  
  return user as User || null
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await sql`
    SELECT * FROM users WHERE id = ${id}
  `
  
  return user as User || null
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = await getUserByUsername(username)
  if (!user) return null
  
  const isValid = await comparePassword(password, user.password_hash)
  return isValid ? user : null
} 