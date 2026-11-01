-- MOTOSYNQ AI — Row Level Security (RLS) Policies Migration (0002_rls.sql)
-- Enforces strict tenant isolation and secure public report consumption via SECURITY DEFINER function

-- 1. Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 3. Vehicles Policies
CREATE POLICY "Users can view their own vehicles"
    ON public.vehicles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
    ON public.vehicles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
    ON public.vehicles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
    ON public.vehicles FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Inspection Sessions Policies
CREATE POLICY "Users can view their own sessions"
    ON public.inspection_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON public.inspection_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON public.inspection_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
    ON public.inspection_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Audio Recordings Policies
CREATE POLICY "Users can view their own audio recordings"
    ON public.audio_recordings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio recordings"
    ON public.audio_recordings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio recordings"
    ON public.audio_recordings FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Sensor Recordings Policies
CREATE POLICY "Users can view their own sensor recordings"
    ON public.sensor_recordings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sensor recordings"
    ON public.sensor_recordings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sensor recordings"
    ON public.sensor_recordings FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Analysis Results Policies
CREATE POLICY "Users can view their own analysis results"
    ON public.analysis_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own analysis results"
    ON public.analysis_results FOR ALL
    USING (auth.uid() = user_id);

-- 8. Mechanic Confirmations Policies
CREATE POLICY "Users can view their own mechanic confirmations"
    ON public.mechanic_confirmations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mechanic confirmations"
    ON public.mechanic_confirmations FOR ALL
    USING (auth.uid() = user_id);

-- 9. Maintenance Events Policies
CREATE POLICY "Users can view their own maintenance events"
    ON public.maintenance_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own maintenance events"
    ON public.maintenance_events FOR ALL
    USING (auth.uid() = user_id);

-- 10. Shared Reports Policies (Owner Management)
CREATE POLICY "Users can view and manage their own shared reports"
    ON public.shared_reports FOR ALL
    USING (auth.uid() = user_id);

-- 11. Public Access Via SECURITY DEFINER Function (No direct anonymous select on base tables)
CREATE OR REPLACE FUNCTION public.get_shared_report(p_token text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_report RECORD;
    v_session RECORD;
    v_vehicle RECORD;
    v_analysis RECORD;
    v_token_hash TEXT;
    v_result JSONB;
BEGIN
    -- Derive token hash
    v_token_hash := encode(digest(p_token, 'sha256'), 'hex');

    -- Lookup report
    SELECT * INTO v_report
    FROM public.shared_reports
    WHERE (token_hash = v_token_hash OR token_hash = p_token)
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW());

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'NOT_FOUND_OR_EXPIRED');
    END IF;

    -- Increment view count atomically
    UPDATE public.shared_reports
    SET view_count = view_count + 1,
        last_viewed_at = NOW()
    WHERE id = v_report.id;

    -- Retrieve linked session
    SELECT * INTO v_session
    FROM public.inspection_sessions
    WHERE id = v_report.session_id;

    -- Retrieve vehicle details
    SELECT id, nickname, make, model, year,
           CASE WHEN (v_report.options->>'hide_registration')::boolean THEN NULL ELSE registration_identifier END as registration_identifier
    INTO v_vehicle
    FROM public.vehicles
    WHERE id = v_session.vehicle_id;

    -- Retrieve analysis results
    SELECT result_category, confidence, uncertainty, model_name, model_version,
           feature_summary, quality_observations, recommendation, completed_at
    INTO v_analysis
    FROM public.analysis_results
    WHERE session_id = v_session.id
    ORDER BY started_at DESC
    LIMIT 1;

    -- Build sanitised output payload honoring options
    v_result := jsonb_build_object(
        'session_id', v_session.id,
        'started_at', v_session.started_at,
        'duration_seconds', v_session.duration_seconds,
        'vehicle', row_to_json(v_vehicle),
        'analysis', row_to_json(v_analysis),
        'options', v_report.options,
        'view_count', v_report.view_count + 1
    );

    RETURN v_result;
END;
$$;
