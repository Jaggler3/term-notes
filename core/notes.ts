import sql from '../lib/sql'
import { Note } from '../lib/db'

export async function createNote(userId: string, title: string, content: string): Promise<Note> {
  const [note] = await sql`
    INSERT INTO notes (user_id, title, content)
    VALUES (${userId}, ${title}, ${content})
    RETURNING *
  `
  
  return note as Note
}

export async function updateNote(noteId: string, userId: string, title: string, content: string): Promise<Note | null> {
  const [note] = await sql`
    UPDATE notes 
    SET title = ${title}, content = ${content}, updated_at = NOW()
    WHERE id = ${noteId} AND user_id = ${userId}
    RETURNING *
  `
  
  return note as Note || null
}

export async function getNote(noteId: string, userId: string): Promise<Note | null> {
  const [note] = await sql`
    SELECT * FROM notes 
    WHERE id = ${noteId} AND user_id = ${userId}
  `
  
  return note as Note || null
}

export async function getNotes(userId: string): Promise<Note[]> {
  const notes = await sql`
    SELECT * FROM notes 
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `
  
  return notes as Note[]
}

export async function deleteNote(noteId: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM notes 
    WHERE id = ${noteId} AND user_id = ${userId}
    RETURNING *
  `
  
  return result.length > 0
} 