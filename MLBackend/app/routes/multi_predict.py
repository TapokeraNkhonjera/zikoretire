from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Request
from app.schema.readiness import ReadinessRequest

from core.multi_predict import predict_all_outputs, get_engine_status

router = APIRouter()


@router.get("/health/multi")
def health_multi(request: Request):
    status = get_engine_status()
    loaded_count = sum(status["models_loaded"].values())
    total_count = len(status["models_loaded"])
    
    if loaded_count == 0:
        health_status = "unhealthy"
    elif loaded_count == total_count:
        health_status = "healthy"
    else:
        health_status = "partial"
    
    return {
        "status": health_status,
        "models_loaded": status["models_loaded"],
        "loaded_count": loaded_count,
        "total_count": total_count,
        "request_id": request.state.request_id,
    }


@router.post("/predict-multi")
def predict_multi(data: ReadinessRequest, request: Request):
    try:
        result = predict_all_outputs(data.model_dump())
        result["request_id"] = request.state.request_id
        return result
    except Exception:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "degraded",
                "error": "INTERNAL_MULTI_PREDICTION_ERROR",
                "message": "The multi-prediction engine failed to process this request.",
                "request_id": request.state.request_id,
            }
        )


@router.get("/models/status")
def models_status(request: Request):
    status = get_engine_status()
    return {
        "models": status["models_loaded"],
        "paths": status["model_paths"],
        "errors": status["model_errors"],
        "request_id": request.state.request_id,
    }
