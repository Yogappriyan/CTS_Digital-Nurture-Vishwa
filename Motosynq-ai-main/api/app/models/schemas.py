from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class VehicleCreate(BaseModel):
    nickname: str
    make: str
    model: str
    year: int
    registration_identifier: Optional[str] = None
    notes: Optional[str] = None

class VehicleResponse(BaseModel):
    id: str
    user_id: str
    nickname: str
    make: str
    model: str
    year: int
    registration_identifier: Optional[str] = None
    notes: Optional[str] = None
    created_at: str

class SessionCreate(BaseModel):
    vehicle_id: str
    client_session_id: str
    started_at: str
    ended_at: str
    duration_seconds: float
    source: str = "android"
    recording_config: Optional[Dict[str, Any]] = None
    sensor_availability: Optional[Dict[str, bool]] = None
    notes: Optional[str] = None

class SessionResponse(BaseModel):
    id: str
    user_id: str
    vehicle_id: str
    client_session_id: str
    started_at: str
    ended_at: str
    duration_seconds: float
    source: str
    recording_config: Optional[Dict[str, Any]] = None
    sensor_availability: Optional[Dict[str, bool]] = None
    status: str
    notes: Optional[str] = None
    created_at: str

class FeatureSummarySchema(BaseModel):
    audio: Optional[Dict[str, Any]] = None
    accelerometer: Optional[Dict[str, Any]] = None
    gyroscope: Optional[Dict[str, Any]] = None

class QualityObservationsSchema(BaseModel):
    audio_clipping_detected: bool = False
    audio_snr_db: Optional[float] = None
    background_noise_level: str = "low"
    sensor_dropout_count: int = 0
    mounting_stability: str = "stable"
    notes: List[str] = Field(default_factory=list)

class AnalysisResponse(BaseModel):
    analysis_id: str
    session_id: str
    status: str
    result_category: str
    confidence: Optional[float] = None
    uncertainty: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    model: Optional[Dict[str, Any]] = None
    supported_classes: List[str] = Field(default_factory=list)
    class_probabilities: Optional[Dict[str, float]] = None
    feature_summary: Optional[FeatureSummarySchema] = None
    quality_observations: Optional[QualityObservationsSchema] = None
    recommendation: Optional[str] = None
    started_at: str
    completed_at: Optional[str] = None
