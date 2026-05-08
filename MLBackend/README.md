# MLBackend Implementation Guide (Testing -> Production)

This backend predicts retirement readiness and returns:
- model prediction (`0.0` to `1.0`)
- risk classification
- explainability factors
- advisory guidance

This README is written as a step-by-step process so you can implement safely without getting lost.

## 1) Current Architecture

- `app/main.py` - FastAPI app entrypoint
- `app/routes/readiness.py` - API endpoints (`/predict-readiness`, `/health/live`, `/health/ready`)
- `app/schema/readiness.py` - request validation rules
- `core/predict.py` - orchestration: features -> model -> explainability -> risk -> advice
- `core/explain.py` - SHAP + safe fallback feature impacts
- `core/risk.py` - score to risk mapping
- `core/advisor.py` - recommendation generation
- `training/pipeline.py` - training and model selection
- `models/latest/model.pkl` - active serving model

## 2) Implementation Roadmap

Follow these phases in order.

### Phase A - Environment and Dependency Lock
1. Create and activate virtual environment.
2. Install dependencies from `requirements.txt`.
3. Confirm imports work for `fastapi`, `sklearn`, `shap`, and `xgboost`.

### Phase B - Data and Training Validation
1. Verify training data exists at `data/data.csv`.
2. Check that required model features match `core/features.py`.
3. Run training pipeline and produce a valid model artifact in `models/latest/model.pkl`.
4. Record MAE and R2 after training.

### Phase C - Inference and API Validation
1. Start API.
2. Check health endpoints:
   - `GET /api/health/live`
   - `GET /api/health/ready`
3. Run `POST /api/predict-readiness` with valid payload.
4. Confirm response includes prediction, risk fields, factors, explanation, and advice.

### Phase D - Failure Safety Validation
Test fail-safe paths intentionally:
1. Remove/rename model file and confirm `/health/ready` returns `503`.
2. Trigger explainability failure and confirm response still returns prediction/risk with warning.
3. Send invalid input and confirm API returns schema validation errors.

### Phase E - Integration with Frontend
1. Wire frontend service call to `/api/predict-readiness`.
2. Handle `status` and `warnings` in UI.
3. Handle degraded/partial responses gracefully.

## 3) Local Setup

```powershell
cd MLBackend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Run API:

```powershell
py -m uvicorn app.main:app --reload
```

Open:
- Docs: `http://127.0.0.1:8000/docs`
- Root: `http://127.0.0.1:8000/`

## 4) Model Training Guide

Run:

```powershell
py -m training.pipeline
```

What happens:
1. Data is loaded (`training/data_loader.py`)
2. Features are selected from `core/features.py`
3. Train/validation split is created
4. Candidate models are benchmarked
5. Best model is saved through versioning utility

Before using a new model in production:
- verify metrics (MAE/R2)
- run one prediction smoke test
- confirm health readiness is green

## 5) API Contract

### Request
`POST /api/predict-readiness`

```json
{
  "age": 30,
  "retirement_age": 60,
  "monthly_income": 300000,
  "monthly_contribution": 50000,
  "current_savings": 1000000,
  "inflation_rate": 8.0,
  "employment_type": 0,
  "job_stability": 0.7,
  "contribution_gap_months": 2
}
```

### Response (normal)
```json
{
  "status": "ok",
  "prediction": 0.63,
  "confidence": 0.88,
  "risk": "MEDIUM",
  "risk_label": "Moderate Risk",
  "risk_color": "yellow",
  "risk_message": "...",
  "risk_summary": "...",
  "risk_priority": "...",
  "readiness_percentage": 63.0,
  "factors": [],
  "explanation": "...",
  "advice": "...",
  "warnings": []
}
```

### Response (degraded)
```json
{
  "status": "degraded",
  "prediction": null,
  "risk": "UNKNOWN",
  "warnings": ["MODEL_UNAVAILABLE"]
}
```

## 6) Fail-Safes Implemented

- Model load protection in `core/predict.py`
- Graceful degraded responses when prediction fails
- Explainability fallback in `core/explain.py`
- API-level exception guard in `app/routes/readiness.py`
- Request ID middleware with `x-request-id` propagation
- Live/readiness health endpoints for deployment checks
- Input validation bounds in `app/schema/readiness.py`

## 7) Deployment Checklist

1. Dependencies installed from lock file.
2. Model file exists in `models/latest/model.pkl`.
3. `GET /api/health/ready` returns success.
4. One real payload prediction tested.
5. Logs monitored for warning/error spikes.
6. Frontend handles `status` + `warnings`.

## 8) Known Limitations

- Confidence is heuristic and not calibrated uncertainty.
- Risk thresholds are static and should be calibrated against validation data.
- Synthetic data assumptions may not fully match real-world user behavior.
- Existing tests should be expanded to assertion-based automated coverage.

## 9) Next Recommended Improvements

1. Add pytest assertions for risk mapping and response contract.
2. Add request IDs and structured logging.
3. Add model/version metadata in every response.
4. Calibrate risk thresholds using empirical score distribution.
