from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
import uuid

class APIError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code

async def api_error_handler(request: Request, exc: APIError) -> JSONResponse:
    request_id = str(uuid.uuid4())
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "request_id": request_id,
            }
        },
    )

async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = str(uuid.uuid4())
    # Never return stack traces to user
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred during processing.",
                "request_id": request_id,
            }
        },
    )
