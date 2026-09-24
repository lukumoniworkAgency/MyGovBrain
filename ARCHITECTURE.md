# Architecture

## Runtime

Next.js App Router with TypeScript and Tailwind CSS. Server components fetch public content through `src/lib/data.ts`; client components handle language selection, Easy Mode, the checker, checklist interaction, and OTP auth.

## Data

Supabase PostgreSQL migrations live in `supabase/migrations/`.

- Reference data: languages, states, districts, departments, categories.
- Service data: services, translations, reusable document types, service documents, and official sources.
- Week 4 state: eligibility rules/translations, user service cases, checklists, and checklist items.
- Week 6 governance: profiles with `is_admin`, audit logs, and minimal analytics events.

Display text belongs in translations or database records. Application code does not contain service or category records.

## Security

RLS is enabled on all application tables. Public roles can read only public-safe content. Authenticated users can read/write only their own cases and checklist rows. Admin content writes require `public.is_admin()` through both server-side checks and database policies. Admin saves create audit log records.

The admin form uses the normal authenticated Supabase session. No service-role key is shipped to the client.

## Request flow

1. The browser requests a route.
2. The server reads the language cookie/query parameter and fetches active database records.
3. Public routes render service data, official source status, and fallback-language warnings.
4. User actions call server actions, which re-check the authenticated user before writes.
5. Admin actions validate input, write related records, and append an audit log.

## Analytics

The allowlisted events are `service_search`, `service_view`, `language_changed`, and `checklist_created`. Events contain only a path and small non-personal metadata. There is no analytics read policy for public roles.

## Operational boundaries

This repository does not yet include AI, voice, OCR/document upload, family mode, multi-state rollout, additional launch languages, admin user management, automated production deployment, or a user feedback collection system.
