import { initDatabase } from './lib/db'
import { authenticateUser, createUser, generateToken, verifyToken } from './core/auth'
import { createNote, updateNote, getNote, getNotes, deleteNote } from './core/notes'
import { renderTemplate, renderNotesList } from './lib/template'

// Initialize database
await initDatabase()

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    
    // Set CORS headers for Term browser
    const headers = {
      'Content-Type': 'text/xml',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers })
    }

    try {
      // Landing page
      if (url.pathname === '/') {
        const page = renderTemplate('./pages/landing.xml', {})
        return new Response(page, { headers })
      }
      
      // Login page
      if (url.pathname === '/login') {
        const page = renderTemplate('./pages/login.xml', {})
        return new Response(page, { headers })
      }
      
      // Signup page
      if (url.pathname === '/signup') {
        const page = renderTemplate('./pages/signup.xml', {})
        return new Response(page, { headers })
      }
      
      // Authentication routes
      if (url.pathname === '/auth/login') {
        const username = url.searchParams.get('username')
        const password = url.searchParams.get('password')
        
        if (!username || !password) {
          return new Response('Missing username or password', { status: 400, headers })
        }
        
        const user = await authenticateUser(username, password)
        if (!user) {
          return new Response('Invalid credentials', { status: 401, headers })
        }
        
        const token = generateToken(user)
        const redirectUrl = `/notes?token=${token}`
        return new Response(`<term type="m100_xml"><action name="[redirect]">visit("${redirectUrl}")</action></term>`, { headers })
      }
      
      if (url.pathname === '/auth/signup') {
        const username = url.searchParams.get('username')
        const email = url.searchParams.get('email')
        const password = url.searchParams.get('password')
        const confirm = url.searchParams.get('confirm')
        
        if (!username || !email || !password || !confirm) {
          return new Response('Missing required fields', { status: 400, headers })
        }
        
        if (password !== confirm) {
          return new Response('Passwords do not match', { status: 400, headers })
        }
        
        try {
          const user = await createUser(username, email, password)
          const token = generateToken(user)
          const redirectUrl = `/notes?token=${token}`
          return new Response(`<term type="m100_xml"><action name="[redirect]">visit("${redirectUrl}")</action></term>`, { headers })
        } catch (error: any) {
          if (error.message.includes('unique constraint')) {
            return new Response('Username or email already exists', { status: 409, headers })
          }
          return new Response('Error creating user', { status: 500, headers })
        }
      }
      
      if (url.pathname === '/auth/logout') {
        return new Response(`<term type="m100_xml"><action name="[redirect]">visit("/")</action></term>`, { headers })
      }
      
      // Notes routes (require authentication)
      const token = url.searchParams.get('token')
      if (!token) {
        return new Response('<term type="m100_xml"><text>Authentication required</text></term>', { status: 401, headers })
      }
      
      const payload = verifyToken(token)
      if (!payload) {
        return new Response('<term type="m100_xml"><text>Invalid token</text></term>', { status: 401, headers })
      }
      
      // Notes list page
      if (url.pathname === '/notes') {
        const notes = await getNotes(payload.userId)
        const notesListHtml = renderNotesList(notes, token)
        const page = renderTemplate('./pages/notes.xml', {
          username: payload.username,
          notesList: notesListHtml,
        })
        return new Response(page, { headers })
      }
      
      // New note page
      if (url.pathname === '/notes/new') {
        const page = renderTemplate('./pages/write.xml', {
          isNew: true,
          noteId: '',
          title: '',
          content: '',
          deleteButton: '',
          token
        })
        return new Response(page, { headers })
      }
      
      // Delete note
      if (url.pathname === '/notes/delete') {
        const noteId = url.searchParams.get('id')
        
        if (!noteId) {
          return new Response('<term type="m100_xml"><text>Missing note ID</text></term>', { status: 400, headers })
        }
        
        const success = await deleteNote(noteId, payload.userId)
        if (!success) {
          return new Response('<term type="m100_xml"><text>Error deleting note or note not found</text></term>', { status: 404, headers })
        }
        
        const redirectUrl = `/notes?token=${token}`
        return new Response(`<term type="m100_xml"><action name="[redirect]">visit("${redirectUrl}")</action></term>`, { headers })
      }

      // Edit note page
      if (url.pathname.startsWith('/notes/') && url.pathname !== '/notes/new' && url.pathname !== '/notes/save') {
        const noteId = url.pathname.split('/')[2]
        const note = await getNote(noteId, payload.userId)
        
        if (!note) {
          return new Response('<term type="m100_xml"><text>Note not found</text></term>', { status: 404, headers })
        }
        
        const page = renderTemplate('./pages/write.xml', {
          isNew: false,
          noteId: noteId,
          title: note.title,
          content: note.content,
          deleteButton: '<link key="d" submit="delete_note" background="red" foreground="white" width="25">Delete Note</link>',
          token
        })
        return new Response(page, { headers })
      }
      
      // Save note
      if (url.pathname === '/notes/save') {
        const title = url.searchParams.get('title')
        const content = url.searchParams.get('content')
        const noteId = url.searchParams.get('id')
        
        if (!title || !content) {
          return new Response('<term type="m100_xml"><text>Missing title or content</text></term>', { status: 400, headers })
        }
        
        let note
        if (noteId && noteId.trim() !== '') {
          note = await updateNote(noteId, payload.userId, title, content)
        } else {
          note = await createNote(payload.userId, title, content)
        }
        
        if (!note) {
          return new Response('<term type="m100_xml"><text>Error saving note</text></term>', { status: 500, headers })
        }
        
        const redirectUrl = `/notes?token=${token}`
        return new Response(`<term type="m100_xml"><action name="[redirect]">visit("${redirectUrl}")</action></term>`, { headers })
      }
      
      return new Response('Not Found', { status: 404, headers })
      
    } catch (error) {
      console.error('Server error:', error)
      return new Response('<term type="m100_xml"><text>Internal Server Error</text></term>', { status: 500, headers })
    }
  }
})

console.log(`Term Notes server listening at http://localhost:${server.port}`) 