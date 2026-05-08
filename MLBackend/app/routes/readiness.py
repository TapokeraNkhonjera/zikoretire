from fastapi import APIRouter
from fastapi import HTTPException
from app.schema.readiness import ReadinessRequest

from core.predict import get_engine_status, predict_readiness

router = APIRouter()


@router.get("/health/live")
def health_live():
    return {"status": "ok"}


@router.get("/health/ready")
def health_ready():
    status = get_engine_status()
    if not status["model_loaded"]:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "reason": "MODEL_UNAVAILABLE",
                "model_path": status["model_path"],
                "error": status["model_error"]
            }
        )
    return {"status": "ready", "model_path": status["model_path"]}

@router.post("/predict-readiness")
def predict(data: ReadinessRequest):
    try:
        result = predict_readiness(data.dict())
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "degraded",
                "error": "INTERNAL_PREDICTION_ERROR",
                "message": "The prediction engine failed to process this request.",
                "debug": str(exc)
            }
        )