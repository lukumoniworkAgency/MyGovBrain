# Citizen Service Platform — Backend ERD

This implementation extends the existing Supabase catalog instead of duplicating it. `profiles` represents `auth.users`; the legacy `centers` table is the canonical CSC directory and is extended by the platform migration.

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : "has"
  PROFILES }o--|| ROLES : "has role"
  STATES ||--o{ DISTRICTS : contains
  STATES ||--o{ SERVICES : scopes
  SERVICE_CATEGORIES ||--o{ SERVICES : groups
  SERVICES ||--o{ SERVICE_DOCUMENTS : requires
  SERVICES ||--o{ SERVICE_FEES : prices
  SERVICES ||--o{ SERVICE_STEPS : guides
  SERVICES ||--o{ SERVICE_FAQS : answers
  CENTERS ||--o{ CSC_SERVICES : offers
  SERVICES ||--o{ CSC_SERVICES : available_as
  PROFILES ||--o{ APPLICATIONS : submits
  SERVICES ||--o{ APPLICATIONS : requested_for
  CENTERS ||--o{ APPLICATIONS : handled_by
  APPLICATIONS ||--o{ APPLICATION_STATUS_HISTORY : records
  PROFILES ||--o{ DOCUMENTS : owns
  APPLICATIONS }o--o{ DOCUMENTS : references
  PROFILES ||--o{ NOTIFICATIONS : receives
  PROFILES }o--o{ SAVED_SERVICES : saves
  PROFILES }o--o{ SAVED_CSC : saves
  JOB_CATEGORIES ||--o{ JOBS : groups
  STATES ||--o{ JOBS : scopes
  STATES ||--o{ SCHOLARSHIPS : scopes
  SCHOLARSHIP_CATEGORIES ||--o{ SCHOLARSHIPS : groups
  PROFILES ||--o{ AI_CONVERSATIONS : asks
  AI_CONVERSATIONS ||--o{ AI_MESSAGES : contains
  PROFILES ||--o{ AUDIT_LOGS : performs
```

## Request lifecycle

`submitted → verification → processing → approved → completed`, with `rejected` as a terminal alternative. `application_status_history` is append-only from the application policy perspective and records actor, timestamp, status, and remarks. SQL triggers maintain history and updated timestamps.

## Document boundary

The `documents` table stores metadata only. Files live in the private `private-documents` Supabase Storage bucket under `auth.uid()/uuid-file-name`. Database metadata ownership and storage folder ownership are both enforced. Clients receive short-lived signed URLs rather than public object URLs.
