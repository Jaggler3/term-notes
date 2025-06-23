import fs from 'fs'

export function renderTemplate(templatePath: string, context: Record<string, any>): string {
  let content = fs.readFileSync(templatePath, 'utf-8')
  
  // Replace ${variable} patterns with context values
  content = content.replace(/\$\{([^}]+)\}/g, (match, variable) => {
    if (variable in context) {
      return String(context[variable])
    }
    return match // Return original if not found
  })
  
  return content
}

export function renderNotesList(notes: any[], token: string): string {
  if (notes.length === 0) {
    return '<text>No notes yet. Press "n" to create your first note!</text>'
  }
  
  let html = ''
  notes.forEach((note, index) => {
    const key = String(index + 1)
    const truncatedTitle = note.title.length > 30 ? note.title.substring(0, 27) + '...' : note.title
    const date = new Date(note.updated_at).toLocaleDateString()
    
    html += `
      <container direction="row">
        <container width="70pc">
          <link key="${key}" url="/notes/${note.id}?token=${token}&amp;noteId=${note.id}&amp;title=${encodeURIComponent(note.title)}&amp;content=${encodeURIComponent(note.content)}" background="cyan" foreground="black" width="70">${truncatedTitle}</link>
        </container>
        <container>
          <text>${date}</text>
        </container>
      </container>
      <br/>
    `
  })
  
  return html
} 