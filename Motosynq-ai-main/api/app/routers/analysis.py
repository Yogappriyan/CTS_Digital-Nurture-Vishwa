from fastapi import APIRouter, Depends, Path
from ..models.schemas import AnalysisResponse
from ..core.security import get_current_user_id
from ..core.errors import APIError
from .sessions import _DEV_ANALYSIS

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_result(analysis_id: str = Path(...), user_id: str = Depends(get_current_user_id)):
    analysis = _DEV_ANALYSIS.get(analysis_id)
    if not analysis or analysis["user_id"] != user_id:
        raise APIError(code="NOT_FOUND", message="Analysis result not found.", status_code=404)
    return analysis
