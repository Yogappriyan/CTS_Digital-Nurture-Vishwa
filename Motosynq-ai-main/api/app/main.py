from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.errors import APIError, api_error_handler, generic_exception_handler
from .routers import vehicles, sessions, analysis
from .services.inference import inference_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multimodal Acoustic & Inertial Condition Monitoring API for MOTOSYNQ AI",
)

# CORS
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(APIError, api_error_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Routers
app.include_router(vehicles.router, prefix=settings.API_V1_PREFIX)
app.include_router(sessions.router, prefix=settings.API_V1_PREFIX)
app.include_router(analysis.router, prefix=settings.API_V1_PREFIX)

@app.get("/health")
async def health_check():
    """
    Liveness probe plus indicator of whether a validated model artifact is loaded.
    """
    return {
        "status": "healthy",
        "service": "motosynq-ai-api",
        "version": settings.VERSION,
        "model_loaded": inference_service.is_configured(),
        "preprocessing_version": "prep-v1.2",
    }
