from fastapi import APIRouter, Depends, Path
from typing import List, Dict, Any
from ..models.schemas import VehicleCreate, VehicleResponse
from ..core.security import get_current_user_id
from ..core.errors import APIError
import uuid
from datetime import datetime

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

# In-memory store for dev/testing when Supabase is not directly reachable
_DEV_VEHICLES: Dict[str, Dict[str, Any]] = {}

@router.post("", response_model=VehicleResponse, status_code=201)
async def create_vehicle(payload: VehicleCreate, user_id: str = Depends(get_current_user_id)):
    veh_id = f"veh-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat() + "Z"
    record = {
        "id": veh_id,
        "user_id": user_id,
        "nickname": payload.nickname,
        "make": payload.make,
        "model": payload.model,
        "year": payload.year,
        "registration_identifier": payload.registration_identifier,
        "notes": payload.notes,
        "created_at": now,
    }
    _DEV_VEHICLES[veh_id] = record
    return record

@router.get("", response_model=List[VehicleResponse])
async def list_vehicles(user_id: str = Depends(get_current_user_id)):
    return [v for v in _DEV_VEHICLES.values() if v["user_id"] == user_id]

@router.get("/{vehicle_id}/health-history")
async def get_vehicle_health_history(
    vehicle_id: str = Path(...),
    user_id: str = Depends(get_current_user_id),
):
    veh = _DEV_VEHICLES.get(vehicle_id)
    if not veh or veh["user_id"] != user_id:
        raise APIError(code="NOT_FOUND", message="Vehicle not found or unauthorized.", status_code=404)
    return {"vehicle_id": vehicle_id, "history": []}
