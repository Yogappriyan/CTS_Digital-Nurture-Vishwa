# MOTOSYNQ AI — REST API Documentation (v1)

Base URL: `/api/v1`  
Protocol: HTTPS  
Authentication: `Authorization: Bearer <Supabase-JWT>`

---

## 1. Error Response Contract
All error responses return standard JSON bodies with HTTP error status codes and **no stack traces**:

```json
{
  "error": {
    "code": "INVALID_AUDIO_FORMAT",
    "message": "Only 16-bit linear PCM WAV files are supported.",
    "request_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }
}
```

### Standard Error Codes
| Code | Status | Description |
|---|---|---|
| `UNAUTHENTICATED` | 401 | Missing or invalid Supabase Bearer JWT token |
| `FORBIDDEN` | 403 | User does not own the requested vehicle or session |
| `NOT_FOUND` | 404 | Resource does not exist |
| `FILE_TOO_LARGE` | 413 | Audio file exceeds 50 MB or CSV exceeds 20 MB |
| `INVALID_AUDIO_FORMAT`| 400 | Non-WAV file, corrupt RIFF header, or non-PCM audio |
| `DURATION_OUT_OF_RANGE`| 400 | Audio duration < 3.0 s or > 300.0 s |
| `INVALID_SENSOR_CSV` | 400 | CSV missing columns `timestamp,x,y,z` or non-numeric |
| `SESSION_MISMATCH` | 400 | Provided `X-Content-SHA256` header does not match upload |
| `MODEL_NOT_CONFIGURED`| 200/503 | No trained model weights loaded; features only |
| `RATE_LIMITED` | 429 | Request rate exceeded allowed limits |

---

## 2. Endpoints

### `GET /health`
Liveness check and model availability probe.
```json
{
  "status": "healthy",
  "service": "motosynq-ai-api",
  "version": "1.0.0",
  "model_loaded": false,
  "preprocessing_version": "prep-v1.2"
}
```

---

### `POST /api/v1/vehicles`
Create a motorcycle profile.
```json
// Request
{
  "nickname": "Interceptor 650",
  "make": "Royal Enfield",
  "model": "Interceptor 650",
  "year": 2023,
  "registration_identifier": "KA-05-MQ-8842",
  "notes": "Handlebar rigid mount"
}

// Response (201 Created)
{
  "id": "veh-a1b2c3d4",
  "user_id": "usr-uuid",
  "nickname": "Interceptor 650",
  "make": "Royal Enfield",
  "model": "Interceptor 650",
  "year": 2023,
  "registration_identifier": "KA-05-MQ-8842",
  "created_at": "2026-10-25T09:00:00Z"
}
```

---

### `POST /api/v1/sessions`
Create an inspection session (Idempotent: repeating the same `client_session_id` returns the existing session).
```json
// Request
{
  "vehicle_id": "veh-a1b2c3d4",
  "client_session_id": "android-rec-20261025-091422",
  "started_at": "2026-10-25T09:14:22Z",
  "ended_at": "2026-10-25T09:14:52Z",
  "duration_seconds": 30.0,
  "source": "android",
  "recording_config": {
    "audio_sample_rate": 16000,
    "audio_channels": 1,
    "sensor_rate_hz": 50,
    "device_model": "Pixel 8a"
  },
  "sensor_availability": {
    "audio": true,
    "accelerometer": true,
    "gyroscope": true
  }
}

// Response (201 Created or 200 OK)
{
  "id": "sess-e5f6g7h8",
  "user_id": "usr-uuid",
  "vehicle_id": "veh-a1b2c3d4",
  "client_session_id": "android-rec-20261025-091422",
  "started_at": "2026-10-25T09:14:22Z",
  "ended_at": "2026-10-25T09:14:52Z",
  "duration_seconds": 30.0,
  "status": "created",
  "created_at": "2026-10-25T09:15:00Z"
}
```

---

### `POST /api/v1/sessions/{id}/audio`
Upload binary WAV audio recording. Supports `X-Content-SHA256` and `Idempotency-Key`.
- **Content-Type**: `multipart/form-data`
- **Field**: `file` (WAV file)

---

### `POST /api/v1/sessions/{id}/sensor-data?sensor_type=accelerometer`
Upload smartphone motion sensor CSV.
- **Content-Type**: `multipart/form-data`
- **Field**: `file` (CSV with `timestamp,x,y,z`)

---

### `POST /api/v1/sessions/{id}/analyze`
Triggers background feature extraction and classification.
Response (202 Accepted):
```json
{
  "analysis_id": "an-12345678",
  "status": "completed",
  "result_category": "normal_pattern"
}
```

When no model is configured (Honesty Rule #2):
```json
{
  "analysis_id": "an-12345678",
  "status": "unavailable",
  "result_category": "model_not_configured",
  "message": "AI model not configured. Features and visualizations are available; no prediction was made.",
  "model": null,
  "supported_classes": []
}
```
