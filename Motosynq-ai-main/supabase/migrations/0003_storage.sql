-- MOTOSYNQ AI — Supabase Storage Buckets & Policies Migration (0003_storage.sql)

-- 1. Create Private Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('audio', 'audio', false, 52428800, ARRAY['audio/wav', 'audio/x-wav']),
    ('sensor-data', 'sensor-data', false, 20971520, ARRAY['text/csv', 'application/json']),
    ('reports', 'reports', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies (Path convention: {user_id}/{vehicle_id}/{session_id}/<filename>)

-- Audio Bucket: Owners only
CREATE POLICY "Users can upload their own audio"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'audio' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can read their own audio"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'audio' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own audio"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'audio' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Sensor-Data Bucket: Owners only
CREATE POLICY "Users can upload their own sensor data"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'sensor-data' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can read their own sensor data"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'sensor-data' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own sensor data"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'sensor-data' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Reports Bucket: Owners only
CREATE POLICY "Users can manage their own generated reports"
    ON storage.objects FOR ALL
    TO authenticated
    USING (
        bucket_id = 'reports' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
