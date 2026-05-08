import os
import threading
from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi import Request

from training.pipeline import run_pipeline

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
TELEMETRY_FILE = os.path.join(BASE_DIR, "data", "telemetry", "inference_events.jsonl")

_TRAINING_LOCK = threading.Lock()
_TRAINING_STATE = {
    "running": False,
    "last_started_at": None,
    "last_finished_at": None,
    "last_status": "never_run",
    "last_result": None,
    "last_error": None,
}


def _utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def _count_telemetry_events():
    if not os.path.exists(TELEMETRY_FILE):
        return 0

    count = 0
    with open(TELEMETRY_FILE, "r", encoding="utf-8") as fh:
        for _ in fh:
            count += 1
    return count


def _run_training_job():
    try:
        result = run_pipeline()
        with _TRAINING_LOCK:
            _TRAINING_STATE["last_status"] = "success"
            _TRAINING_STATE["last_result"] = result
            _TRAINING_STATE["last_error"] = None
    except Exception as exc:
        with _TRAINING_LOCK:
            _TRAINING_STATE["last_status"] = "failed"
            _TRAINING_STATE["last_error"] = str(exc)
    finally:
        with _TRAINING_LOCK:
            _TRAINING_STATE["running"] = False
            _TRAINING_STATE["last_finished_at"] = _utc_now_iso()


@router.get("/train-status")
def train_status(request: Request):
    with _TRAINING_LOCK:
        state = dict(_TRAINING_STATE)

    return {
        "status": "ok",
        "request_id": request.state.request_id,
        "training": state,
        "telemetry_events": _count_telemetry_events(),
    }


@router.post("/train-model")
def train_model(request: Request):
    with _TRAINING_LOCK:
        if _TRAINING_STATE["running"]:
            return {
                "status": "accepted",
                "request_id": request.state.request_id,
                "message": "Training is already in progress.",
                "training": dict(_TRAINING_STATE),
            }

        _TRAINING_STATE["running"] = True
        _TRAINING_STATE["last_started_at"] = _utc_now_iso()
        _TRAINING_STATE["last_status"] = "running"
        _TRAINING_STATE["last_error"] = None

    thread = threading.Thread(target=_run_training_job, daemon=True)
    thread.start()

    return {
        "status": "accepted",
        "request_id": request.state.request_id,
        "message": "Training job started.",
    }
