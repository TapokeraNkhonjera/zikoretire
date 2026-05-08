from typing import Any

from pydantic import BaseModel


class TelemetryRequest(BaseModel):
    request_id: str | None = None
    source: str = "frontend-simulation-run"
    input_payload: dict[str, Any]
    ml_payload: dict[str, Any]
    result_meta: dict[str, Any]
