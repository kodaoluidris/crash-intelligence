# Crash Intelligence — Lead Management Platform

Upload a crash-report PDF → Claude extracts the crash, vehicles, and every person
involved → victims are saved as leads → run people-search enrichment to recover the
redacted contact info (phone, email, social handles) → work the lead through a status
pipeline with notes and role-based access.

## Stack

| Layer     | Tech                                                        |
|-----------|-------------------------------------------------------------|
| Backend   | Laravel 12 (PHP 8.3), Sanctum token auth, Spatie roles      |
| Database  | PostgreSQL 16 (Docker)                                       |
| Extraction| Anthropic Claude (PDF → structured JSON via tool calling)   |
| Frontend  | React 19 + TypeScript + Vite + Tailwind CSS v4              |

## Data model

`crash_reports` → `crash_vehicles` → `crash_victims` → `victim_contact_enrichment`
plus `enrichment_searches`, `crash_documents`, `victim_notes`, `victim_statuses`,
`audit_logs`, and Spatie's `users` / `roles` / `permissions`.

## Running it

### 1. Database
```bash
# from crash_reports/
DOCKER_CONFIG="$PWD/.docker-clean" docker-compose up -d   # Postgres on :5433
```

### 2. Backend (http://127.0.0.1:8001)
```bash
cd backend
php artisan migrate --seed     # creates schema + roles + admin user
php artisan serve --port=8001
```
Seeded admin: **admin@crash.local / password**

### 3. Frontend (http://localhost:5173)
```bash
cd frontend
npm install
npm run dev
```
The Vite dev server proxies `/api` → `http://127.0.0.1:8001`.

## PDF extraction

Configured in `backend/.env`:

```env
EXTRACTION_DRIVER=claude        # or "stub" for a built-in sample (no API key)
ANTHROPIC_API_KEY=sk-ant-...    # required when driver=claude
ANTHROPIC_MODEL=claude-opus-4-8
```

When the API key is empty the service automatically falls back to the stub
extractor, so the whole upload → extract → ingest pipeline is demoable offline.

## Enrichment (people-search)

`ENRICHMENT_DRIVER=stub` returns synthetic-but-stable contact data. To plug in a
real provider (BeenVerified, Spokeo, WhitePages, a scraper, etc.), set the driver
and implement `EnrichmentService::callProvider()` in
`backend/app/Services/Enrichment/EnrichmentService.php`.

## Roles

`Admin` (full + user management), `Manager`, `Researcher`, `Data Entry`,
`Sales Agent`, `Attorney`. Permissions gate both the API routes and the UI.
