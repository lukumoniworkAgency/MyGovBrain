# MyGovBrain AI

Week 1 foundation for the database-driven government services platform.

## Local setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add the Supabase project URL and publishable key.
4. Start the development server with `npm run dev`.

The app renders a deploy check rather than service content. With valid Supabase credentials, it queries the `languages` table server-side and displays the row count.

## Supabase

The database is defined only through the SQL files in `supabase/migrations/`.

With the Supabase CLI installed and linked to the project:

```bash
supabase db push
```

For a local Supabase instance:

```bash
supabase start
supabase db reset
```

Enable email and phone OTP providers in the Supabase dashboard under Authentication. No social providers or admin UI are included in Week 1.

## Environment variables

`.env.local` is ignored by Git. Commit only `.env.example` with placeholder values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Quality checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

No state, language, service, department, or document records are seeded in application code.
