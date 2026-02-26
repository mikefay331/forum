# ForumHub 💬

A modern, fully functional community forums web application built with Next.js 14, Supabase, and Tailwind CSS.

## Screenshots

> _Screenshots placeholder — run the app and take screenshots here._

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database & Auth**: Supabase (PostgreSQL, Auth, Realtime, RLS)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Markdown**: react-markdown + remark-gfm
- **Deployment**: Vercel-ready

## Features

- 🗂️ Categorized discussion boards
- 🔐 Authentication (email/password)
- 📝 Markdown editor with preview
- ⚡ Real-time updates via Supabase Realtime
- 🌙 Dark mode with system preference detection
- 📱 Fully responsive design
- 🔍 Full-text search
- 👤 User profiles
- 👍 Post reactions/likes
- 📌 Pinned & 🔒 locked threads (admin/mod)

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account and project

## Setup

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd forum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a Supabase project** at [supabase.com](https://supabase.com)

4. **Run migrations** — In the Supabase SQL editor, run the contents of:
   - `supabase/migrations/00001_initial_schema.sql`
   - `supabase/seed.sql`

5. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase URL and anon key
   ```

6. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Database Schema

- `profiles` — User profiles (auto-created on signup via trigger)
- `categories` — Forum categories
- `threads` — Discussion threads
- `posts` — Replies to threads
- `reactions` — Likes/reactions on posts

All tables have Row Level Security (RLS) enabled.

## Deployment (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push and open a Pull Request

## License

MIT
