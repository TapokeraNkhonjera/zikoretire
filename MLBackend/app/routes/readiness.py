from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Request
from app.schema.readiness import ReadinessRequest

from core.predict import get_engine_status, predict_readiness

router = APIRouter()


@router.get("/health/live")
def health_live(request: Request):
    return {"status": "ok", "request_id": request.state.request_id}


@router.get("/health/ready")
def health_ready(request: Request):
    status = get_engine_status()
    if not status["model_loaded"]:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "reason": "MODEL_UNAVAILABLE",
                "model_path": status["model_path"],
                "error": status["model_error"],
                "request_id": request.state.request_id,
            }
        )
    return {
        "status": "ready",
        "model_path": status["model_path"],
        "request_id": request.state.request_id,
    }

@router.post("/predict-readiness")
def predict(data: ReadinessRequest, request: Request):
    try:
        result = predict_readiness(data.model_dump())
        result["request_id"] = request.state.request_id
        return result
    except Exception:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "degraded",
                "error": "INTERNAL_PREDICTION_ERROR",
                "message": "The prediction engine failed to process this request.",
                "request_id": request.state.request_id,
            }
        )