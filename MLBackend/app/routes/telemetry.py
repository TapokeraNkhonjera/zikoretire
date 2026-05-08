import json
import os
from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi import Request

from app.schema.telemetry import TelemetryRequest

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
TELEMETRY_DIR = os.path.join(BASE_DIR, "data", "telemetry")
TELEMETRY_FILE = os.path.join(TELEMETRY_DIR, "inference_events.jsonl")


@router.post("/telemetry/inference")
def log_inference_telemetry(payload: TelemetryRequest, request: Request):
    os.makedirs(TELEMETRY_DIR, exist_ok=True)

    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "request_id": payload.request_id or request.state.request_id,
        "source": payload.source,
        "input_payload": payload.input_payload,
        "ml_payload": payload.ml_payload,
        "result_meta": payload.result_meta,
    }

    with open(TELEMETRY_FILE, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(event, ensure_ascii=True) + "\n")

    return {
        "status": "ok",
        "request_id": request.state.request_id,
    }
