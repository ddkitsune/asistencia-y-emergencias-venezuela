# Cloudflare + Supabase Deploy Plan

**Goal:** Deploy "Asistencia y Emergencias Venezuela" on Cloudflare Pages + Functions with Supabase (Auth + PostgreSQL).

**Architecture:** Cloudflare Pages serves the Vite-built static frontend. Pages Functions are the API gateway, using Supabase JS client (service_role key) for PostgreSQL access. Supabase Auth (Google OAuth) protects all endpoints.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Cloudflare Pages + Functions, Supabase (PostgreSQL + Auth)

## File Structure

```
asistencia-y-emergencias-venezuela/
├── functions/
│   ├── _db.ts                    # Supabase Admin client init + verifyToken
│   ├── _middleware.ts            # JWT verification middleware
│   ├── _types.ts                 # Shared types + Database type
│   └── api/
│       ├── emergencies.ts, emergencies/[id].ts
│       ├── volunteers.ts, volunteers/[id].ts
│       ├── incidents.ts, incidents/[id].ts
│       ├── resources.ts, resources/[id].ts
│       ├── notifications.ts, notifications/mark-read.ts
│       └── posts.ts, posts/[id].ts, posts/[id]/{like,verify,comments}.ts
├── src/
│   ├── contexts/AuthContext.tsx   # Supabase Auth + Google OAuth
│   ├── hooks/useApi.ts           # Fetch with Bearer token
│   ├── components/LoginButton.tsx # Login/logout UI
│   └── App.tsx                   # Wraps AuthProvider
├── supabase/
│   └── migration.sql             # PostgreSQL tables + RLS
└── ...
```
