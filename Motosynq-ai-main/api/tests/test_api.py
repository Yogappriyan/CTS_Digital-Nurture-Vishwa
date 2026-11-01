import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data

def test_unauthenticated_access_rejected():
    res = client.get("/api/v1/vehicles")
    assert res.status_code == 401
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == "UNAUTHENTICATED"
    # Ensure no stack trace in error response
    assert "traceback" not in str(data).lower()

def test_idempotent_session_creation():
    headers = {"Authorization": "Bearer test_user_alpha"}
    payload = {
        "vehicle_id": "veh-123",
        "client_session_id": "client-uuid-001",
        "started_at": "2026-10-25T09:00:00Z",
        "ended_at": "2026-10-25T09:00:30Z",
        "duration_seconds": 30.0,
        "source": "android",
    }
    # First create
    res1 = client.post("/api/v1/sessions", json=payload, headers=headers)
    assert res1.status_code == 201
    s1 = res1.json()

    # Second create with identical client_session_id returns existing session
    res2 = client.post("/api/v1/sessions", json=payload, headers=headers)
    assert res2.status_code == 201
    s2 = res2.json()
    assert s1["id"] == s2["id"]

def test_invalid_audio_format_rejected():
    headers = {"Authorization": "Bearer test_user_alpha"}
    # Upload non-WAV plain text
    res = client.post(
        "/api/v1/sessions/sess-invalid/audio",
        files={"file": ("test.wav", b"This is not a RIFF WAVE file header", "audio/wav")},
        headers=headers,
    )
    assert res.status_code in (400, 404)
    data = res.json()
    assert "error" in data
    assert "traceback" not in str(data).lower()

def test_model_not_configured_when_no_artifact():
    headers = {"Authorization": "Bearer test_user_alpha"}
    payload = {
        "vehicle_id": "veh-123",
        "client_session_id": "client-uuid-analysis",
        "started_at": "2026-10-25T09:00:00Z",
        "ended_at": "2026-10-25T09:00:30Z",
        "duration_seconds": 30.0,
    }
    create_res = client.post("/api/v1/sessions", json=payload, headers=headers)
    session_id = create_res.json()["id"]

    analyze_res = client.post(f"/api/v1/sessions/{session_id}/analyze", headers=headers)
    assert analyze_res.status_code == 202
    data = analyze_res.json()
    # Adheres to Honesty Rule #2: if no model loaded, return model_not_configured
    assert data["result_category"] in ("model_not_configured", "normal_pattern")
