# MOTOSYNQ AI — Security & Privacy Architecture (SECURITY.md)

## 1. Zero Secrets in Client Architecture
- Browser code contains **only** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- The Supabase `service_role` key is **never** committed or packaged in the frontend bundle. It resides exclusively on the backend container API.

## 2. Multi-Tenant Isolation & Row Level Security (RLS)
- Every relational table (`vehicles`, `inspection_sessions`, `audio_recordings`, `sensor_recordings`, `analysis_results`, `mechanic_confirmations`, `maintenance_events`, `shared_reports`) enforces PostgreSQL Row-Level Security.
- Policies verify `auth.uid() = user_id` for all CRUD queries.
- Backend API endpoints re-verify ownership in Python business logic before initiating file or inference jobs.

## 3. Token-Gated Public Report Sharing
- Public reports are never exposed via direct anonymous table queries.
- Instead, access is gated through the `get_shared_report(p_token text)` `SECURITY DEFINER` function.
- Incoming tokens are hashed via SHA-256 and matched against `token_hash`.
- Reports that have expired (`expires_at < NOW()`) or been revoked (`revoked_at IS NOT NULL`) are rejected.
- Private registration plates are masked according to user privacy options.

## 4. Input & Stream Validation
- **Client-Side & Server-Side Dual Parsing**: Both frontend (`validateWavFile`) and backend (`validate_audio_wav`) parse the binary RIFF/WAVE header to prevent malicious payload spoofing.
- **Strict Size Limits**: Audio files are limited to 50 MB; CSVs are limited to 20 MB.
- **Monotonicity & Sensor Clocks**: CSV streams are checked for strict timestamp monotonicity and sample rate consistency.

## 5. Security Headers & Content Policy
- Configured in `vercel.json`:
  - `Content-Security-Policy`: Disallows untrusted scripts; allows WebGL and Web Audio processing.
  - `X-Content-Type-Options`: `nosniff`
  - `X-Frame-Options`: `DENY`
  - `Referrer-Policy`: `strict-origin-when-cross-origin`
  - `Permissions-Policy`: `camera=(), geolocation=(), microphone=(self)`
