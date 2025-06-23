import sql from './sql'

export interface User {
  id: string
  username: string
  email: string
  password_hash: string
  created_at: Date
}

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  created_at: Date
  updated_at: Date
}

export async function initDatabase() {
  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `

  // Create notes table
  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `

  // Create index on user_id for faster queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)
  `

  // Create index on updated_at for sorting
  await sql`
    CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC)
  `
} 