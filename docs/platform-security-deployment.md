# Backend Security and Deployment

## Security model

- Supabase Auth owns identity and session rotation. The browser uses SSR cookies; server routes use the authenticated user context.
- `citizen`, `csc_operator`, `admin`, and `super_admin` are application roles. Role checks are repeated in server route guards and RLS; UI visibility is not authorization.
- Public reads are limited to published services/jobs/scholarships and verified centers. User, application, document, notification, saved-item, and AI rows are owner-scoped.
- Files accept PDF/JPEG/PNG/WebP only, are capped at 10 MB, and are stored under a user-owned folder in a private bucket. Use signed URLs with a short expiry.
- Inputs are validated with Zod. API responses use stable error codes and never include database error details. Rate limits are per user/IP and applied before expensive operations.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. Keep it server-only for future workers, email dispatch, and trusted migrations.
- Audit administrative changes and application/document access. Redact document contents, tokens, passwords, and PII from logs.

## API surface

Public catalog endpoints: `/api/services`, `/api/csc`, `/api/jobs`, `/api/scholarships`. Authenticated endpoints: `/api/applications`, `/api/documents`, `/api/notifications`, `/api/profile`. Admin analytics is protected by `/api/admin`. The existing `/api/ai` route remains isolated and rate limited.

## Deployment sequence

1. Create a Supabase project and apply all files in `supabase/migrations` in lexical order.
2. Configure Auth providers: email OTP, magic link, and Google OAuth. Set exact redirect URLs for local, preview, and production environments.
3. Create the private Storage bucket through the migration; verify object policies and MFA for privileged accounts.
4. Set server-only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and Supabase Auth/site settings. Configure email and future WhatsApp/SMS providers in workers, not route handlers.
5. Deploy a preview, run typecheck/tests/build, then production. Seed reference data using a protected service-role job, never a public request.
6. Monitor failed auth, rate-limit spikes, RLS denials, signed-URL issuance, and application transition errors. Back up Postgres and configure point-in-time recovery.

## Operational safeguards

Use a connection pooler for server workloads, index pagination by `(status, deadline)` and application ownership, add idempotency keys for email/WhatsApp jobs, and move notification delivery to a queue/worker when volume grows. Review RLS and storage policies during every migration.
