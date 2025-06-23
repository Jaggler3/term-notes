# Term Notes

A simple note-taking application built for the Term browser. This project demonstrates how to create web applications that work with the Term browser's XML-based interface.

## Features

- User authentication (signup/login)
- Create, edit, and view notes
- Session management with JWT tokens
- PostgreSQL database with Neondb
- Responsive XML-based UI

## Setup

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
# Create a .env file with:
DATABASE_URL=your_neondb_connection_string
JWT_SECRET=your_jwt_secret_key
```

3. Run the server:
```bash
bun run main.ts
```

The server will start on `http://localhost:3000`

## Usage

1. Open the Term browser
2. Navigate to `http://localhost:3000`
3. Sign up for a new account or log in
4. Create and manage your notes

## Project Structure

- `main.ts` - Main server file with all routes
- `lib/` - Database connection and utilities
- `core/` - Business logic (auth, notes)
- `pages/` - XML templates for Term browser
- `components/` - Reusable XML components

## Database Schema

The application creates two tables:
- `users` - User accounts with authentication
- `notes` - User notes with titles and content

## Limitations

This project explores the limitations of building web applications for the Term browser. Some challenges include:

- Limited form handling (single input per action)
- No client-side state management
- URL-based session tokens
- Simple template system
- Limited styling options

## Development

To test the application:

1. Start the server with `bun run main.ts`
2. Use the Term browser to navigate to `http://localhost:3000`
3. Test the authentication flow and note creation 