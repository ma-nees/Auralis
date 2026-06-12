# Auralis

Auralis is a mobile-first music streaming app built with TanStack Start, React, TypeScript, Tailwind CSS, and Supabase authentication.

The app includes a music dashboard, search, favorites, library pages, a bottom music player, Google sign-in, SoundCloud and YouTube-powered music search, and an optional AI music assistant for voice or typed playback commands.

## Features

- Google sign-in through Supabase
- Avatar selection during login
- Trending songs, playlists, artists, and fresh tracks
- Search across SoundCloud and YouTube-backed sources
- Playback controls with queue support
- Favorites and user music library flows
- Optional AI bot endpoint for commands like play, pause, next, like, and volume
- Responsive UI built with Tailwind CSS and Radix UI primitives

## Tech Stack

- React 19
- TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS
- Supabase
- Radix UI
- React Icons and Lucide React

## Project Structure

```text
src/
  components/      Shared UI and app components
  context/         Player state and playback context
  data/            Music data types and local data
  lib/             Supabase, music search, utilities, server helpers
  routes/          TanStack Router file routes
  server.ts        Server entry and API routes
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

If there is no `.env.example`, create `.env` and add the values below.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional AI assistant settings
BOT_KEY=your_ai_provider_api_key
BOT_API_URL=https://api.openai.com/v1/chat/completions
BOT_MODEL=gpt-4o-mini

# Optional SoundCloud OAuth token
SOUNDCLOUD_OAUTH_TOKEN=
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Available Scripts

```bash
npm run dev        # Start the Vite dev server
npm run build      # Build the app for production
npm run build:dev  # Build in development mode
npm run preview    # Preview the production build
npm run lint       # Run ESLint
npm run format     # Format files with Prettier
```

## API Routes

The server exposes music and assistant endpoints from `src/server.ts`.

```text
POST /api/bot/respond
GET  /api/youtube/search?q=<query>
GET  /api/youtube/stream?id=<videoId>
GET  /api/soundcloud
GET  /api/soundcloud/search?q=<query>
GET  /api/soundcloud/search/tracks?q=<query>
GET  /api/soundcloud/track?id=<trackId>
GET  /api/soundcloud/stream?id=<trackId>
GET  /api/soundcloud/user?id=<userId>
GET  /api/soundcloud/user/tracks?id=<userId>
GET  /api/soundcloud/playlist?id=<playlistId>
```

## Supabase Setup

1. Create a Supabase project.
2. Enable Google as an auth provider.
3. Add your app URL to the allowed redirect URLs.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`.

For local development, the Google redirect URL is usually:

```text
http://localhost:5173
```

## Notes

- Run package commands from this folder.
- The AI assistant works only when `BOT_KEY` is configured.
- Some music search and stream providers may depend on third-party service availability.
