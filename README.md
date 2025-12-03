# Health Assist Avatar

A personal health companion web application.

## Setup

1. **Environment Variables**
   Copy `env.example` to `.env.local` and add your Supabase credentials:
   ```bash
   cp env.example .env.local
   ```
   Update `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

2. **Database Setup**
   Run the SQL commands in `supabase/schema.sql` in your Supabase project's SQL Editor to create the tables and policies.

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Features

- **Authentication**: Email/Password login & signup via Supabase.
- **Dashboard**: Track steps, water, sleep, mood, and medications.
- **Chat Assistant**: AI health assistant (mocked) with streaming response.
- **Demo Data**: "Load Demo Data" button in Dashboard to populate metrics.

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- ShadCN UI
- Supabase (Auth & DB)
- React Query
