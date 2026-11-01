-- MOTOSYNQ AI — PostgreSQL Database Schema Migration (0001_schema.sql)
-- Intelligent Motorcycle Condition Monitoring Through Multimodal Sensor Fusion

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE session_source AS ENUM ('android', 'web_upload');
CREATE TYPE session_status AS ENUM ('created', 'uploading', 'uploaded', 'validated', 'processing', 'processed', 'failed');
CREATE TYPE sensor_type_enum AS ENUM ('accelerometer', 'gyroscope');
CREATE TYPE analysis_status_enum AS ENUM ('queued', 'running', 'completed', 'failed', 'unavailable');
CREATE TYPE result_category_enum AS ENUM ('normal_pattern', 'abnormal_pattern', 'inconclusive', 'unsuitable_recording', 'model_not_configured');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    registration_identifier TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Inspection Sessions Table
CREATE TABLE IF NOT EXISTS public.inspection_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    client_session_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ NOT NULL,
    duration_seconds NUMERIC NOT NULL,
    source session_source NOT NULL DEFAULT 'android',
    recording_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    sensor_availability JSONB NOT NULL DEFAULT '{"audio": true, "accelerometer": false, "gyroscope": false}'::jsonb,
    status session_status NOT NULL DEFAULT 'created',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_client_session UNIQUE (user_id, client_session_id)
);

-- 4. Audio Recordings Table
CREATE TABLE IF NOT EXISTS public.audio_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.inspection_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    sample_rate INTEGER NOT NULL DEFAULT 16000,
    channels INTEGER NOT NULL DEFAULT 1,
    duration_seconds NUMERIC NOT NULL,
    size_bytes BIGINT NOT NULL,
    sha256 TEXT NOT NULL,
    input_device_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Sensor Recordings Table
CREATE TABLE IF NOT EXISTS public.sensor_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.inspection_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sensor_type sensor_type_enum NOT NULL,
    storage_path TEXT NOT NULL,
    sample_count INTEGER NOT NULL,
    nominal_rate_hz NUMERIC NOT NULL DEFAULT 50,
    size_bytes BIGINT NOT NULL,
    sha256 TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Analysis Results Table
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.inspection_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status analysis_status_enum NOT NULL DEFAULT 'queued',
    result_category result_category_enum NOT NULL DEFAULT 'model_not_configured',
    confidence NUMERIC,
    uncertainty JSONB,
    supported_classes JSONB NOT NULL DEFAULT '[]'::jsonb,
    class_probabilities JSONB,
    model_name TEXT,
    model_version TEXT,
    preprocessing_version TEXT,
    feature_summary JSONB,
    quality_observations JSONB,
    recommendation TEXT,
    error_code TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 7. Mechanic Confirmations Table (Strictly separated from AI observations)
CREATE TABLE IF NOT EXISTS public.mechanic_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.inspection_sessions(id) ON DELETE SET NULL,
    component TEXT NOT NULL,
    diagnosis_text TEXT NOT NULL,
    mechanic_name TEXT NOT NULL,
    workshop_name TEXT,
    confirmed_on DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Maintenance Events Table
CREATE TABLE IF NOT EXISTS public.maintenance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    mileage_km INTEGER,
    performed_by TEXT NOT NULL,
    mechanic_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Shared Reports Table (Token-gated individual access)
CREATE TABLE IF NOT EXISTS public.shared_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.inspection_sessions(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    options JSONB NOT NULL DEFAULT '{"hide_registration": true, "hide_audio": false, "include_sensor_graphs": true}'::jsonb,
    view_count INTEGER NOT NULL DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes on foreign keys and queries
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id_created ON public.vehicles(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_vehicle_started ON public.inspection_sessions(vehicle_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.inspection_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_session_id ON public.audio_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_sensor_session_id ON public.sensor_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_analysis_session_id ON public.analysis_results(session_id);
CREATE INDEX IF NOT EXISTS idx_mechanic_vehicle_id ON public.mechanic_confirmations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id ON public.maintenance_events(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_token_hash ON public.shared_reports(token_hash);
