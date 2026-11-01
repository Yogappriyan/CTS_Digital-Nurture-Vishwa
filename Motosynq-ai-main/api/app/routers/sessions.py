from fastapi import APIRouter, Depends, Path, Query, Header, UploadFile, File
from typing import List, Optional, Dict, Any
from ..models.schemas import SessionCreate, SessionResponse
from ..core.security import get_current_user_id
from ..core.errors import APIError
from ..services.audio_validation import validate_audio_wav
from ..services.sensor_validation import validate_sensor_csv
from ..services.inference import inference_service
from ..core.config import settings
import uuid
import hashlib
from datetime import datetime

router = APIRouter(prefix="/sessions", tags=["Inspection Sessions"])

_DEV_SESSIONS: Dict[str, Dict[str, Any]] = {}
_DEV_ANALYSIS: Dict[str, Dict[str, Any]] = {}

@router.post("", response_model=SessionResponse, status_code=201)
async def create_session(payload: SessionCreate, user_id: str = Depends(get_current_user_id)):
    # Idempotency check: returns existing session if repeated
    for s in _DEV_SESSIONS.values():
        if s["user_id"] == user_id and s["client_session_id"] == payload.client_session_id:
            return s

    sess_id = f"sess-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat() + "Z"
    record = {
        "id": sess_id,
        "user_id": user_id,
        "vehicle_id": payload.vehicle_id,
        "client_session_id": payload.client_session_id,
        "started_at": payload.started_at,
        "ended_at": payload.ended_at,
        "duration_seconds": payload.duration_seconds,
        "source": payload.source,
        "recording_config": payload.recording_config or {},
        "sensor_availability": payload.sensor_availability or {},
        "status": "created",
        "notes": payload.notes,
        "created_at": now,
    }
    _DEV_SESSIONS[sess_id] = record
    return record

@router.get("", response_model=List[SessionResponse])
async def list_sessions(
    vehicle_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
):
    results = [s for s in _DEV_SESSIONS.values() if s["user_id"] == user_id]
    if vehicle_id:
        results = [s for s in results if s["vehicle_id"] == vehicle_id]
    if status:
        results = [s for s in results if s["status"] == status]
    return results

@router.get("/{session_id}")
async def get_session(session_id: str = Path(...), user_id: str = Depends(get_current_user_id)):
    sess = _DEV_SESSIONS.get(session_id)
    if not sess or sess["user_id"] != user_id:
        raise APIError(code="NOT_FOUND", message="Session not found or access denied.", status_code=404)
    
    latest_analysis = None
    for a in _DEV_ANALYSIS.values():
        if a.get("session_id") == session_id:
            latest_analysis = a
            break

    return {**sess, "latest_analysis": latest_analysis}

@router.post("/{session_id}/audio")
async def upload_audio(
    session_id: str = Path(...),
    file: UploadFile = File(...),
    idempotency_key: Optional[str] = Header(None),
    x_content_sha256: Optional[str] = Header(None),
    user_id: str = Depends(get_current_user_id),
):
    sess = _DEV_SESSIONS.get(session_id)
    if not sess or sess["user_id"] != user_id:
        raise APIError(code="NOT_FOUND", message="Session not found.", status_code=404)

    content = await file.read()

    # Verify SHA256 if provided
    computed_sha256 = hashlib.sha256(content).hexdigest()
    if x_content_sha256 and computed_sha256.lower() != x_content_sha256.lower():
        raise APIError(
            code="SESSION_MISMATCH",
            message=f"Provided X-Content-SHA256 ({x_content_sha256}) does not match computed payload hash ({computed_sha256}).",
            status_code=400,
        )

    # Validate WAV
    wav_meta = validate_audio_wav(content, max_mb=settings.MAX_AUDIO_MB)
    sess["status"] = "validated"
    sess["audio_recording"] = {
        "sample_rate": wav_meta["sample_rate"],
        "channels": wav_meta["channels"],
        "duration_seconds": wav_meta["duration_seconds"],
        "sha256": computed_sha256,
    }

    return {"status": "uploaded", "audio": wav_meta, "sha256": computed_sha256}

@router.post("/{session_id}/sensor-data")
async def upload_sensor_data(
    session_id: str = Path(...),
    sensor_type: str = Query(..., regex="^(accelerometer|gyroscope)$"),
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    sess = _DEV_SESSIONS.get(session_id)
    if not sess or sess["user_id"] != user_id:
        raise APIError(code="NOT_FOUND", message="Session not found.", status_code=404)

    text = (await file.read()).decode("utf-8", errors="replace")
    csv_meta = validate_sensor_csv(text, max_mb=settings.MAX_CSV_MB)
    return {"status": "uploaded", "sensor_type": sensor_type, "metadata": csv_meta}

@router.post("/{session_id}/analyze", status_code=202)
async def analyze_session(session_id: str = Path(...), user_id: str = Depends(get_current_user_id)):
    sess = _DEV_SESSIONS.get(session_id)
    if not sess or sess["user_id"] != user_id:
        raise APIError(code="NOT_FOUND", message="Session not found.", status_code=404)

    analysis_id = f"an-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat() + "Z"

    # Run honest inference service
    prediction = inference_service.predict({})

    result = {
        "analysis_id": analysis_id,
        "session_id": session_id,
        "user_id": user_id,
        **prediction,
        "started_at": now,
        "completed_at": now,
    }
    _DEV_ANALYSIS[analysis_id] = result
    sess["status"] = "processed"

    return {"analysis_id": analysis_id, "status": result["status"], "result_category": result["result_category"]}
