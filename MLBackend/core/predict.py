import os
import joblib
import pandas as pd
import numpy as np

from core.features import FEATURES
from core.explain import compute_feature_impacts, generate_explanation
from core.risk import classify_risk
from core.advisor import generate_advice


# =========================================================
# MODEL LOAD
# =========================================================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "latest",
    "model.pkl"
)

MODEL = None
MODEL_LOAD_ERROR = None
try:
    MODEL = joblib.load(MODEL_PATH)
except Exception as exc:
    MODEL_LOAD_ERROR = str(exc)


def get_engine_status():
    return {
        "model_loaded": MODEL is not None,
        "model_path": MODEL_PATH,
        "model_error": MODEL_LOAD_ERROR
    }


# =========================================================
# FEATURE BUILDER (STRICT CONTRACT)
# =========================================================
def build_features(data: dict):

    return [
        data.get("age", 30),
        data.get("monthly_income", 300000),
        data.get("monthly_contribution", 50000),
        data.get("current_savings", 0),
        data.get("inflation_rate", 8),
        data.get("employment_type", 0),
        data.get("job_stability", 0.5),
        data.get("contribution_gap_months", 3)
    ]


# =========================================================
# MAIN ENGINE
# =========================================================
def predict_readiness(data: dict):
    if MODEL is None:
        return {
            "status": "degraded",
            "prediction": None,
            "confidence": 0.0,
            "risk": "UNKNOWN",
            "risk_label": "Unknown Risk",
            "risk_color": "gray",
            "risk_message": "Prediction service is temporarily unavailable.",
            "risk_summary": "Model artifact could not be loaded.",
            "risk_priority": "Retry later or contact support.",
            "readiness_percentage": None,
            "factors": [],
            "explanation": "Explainability unavailable because prediction failed.",
            "advice": "Please try again later.",
            "warnings": ["MODEL_UNAVAILABLE"],
            "error": MODEL_LOAD_ERROR
        }

    # -------------------------
    # FEATURES
    # -------------------------
    features = build_features(data)

    X_input = pd.DataFrame([features], columns=FEATURES)

    # -------------------------
    # PREDICTION
    # -------------------------
    try:
        raw_prediction = MODEL.predict(X_input)[0]
        prediction = float(np.clip(raw_prediction, 0, 1))
    except Exception as exc:
        return {
            "status": "degraded",
            "prediction": None,
            "confidence": 0.0,
            "risk": "UNKNOWN",
            "risk_label": "Unknown Risk",
            "risk_color": "gray",
            "risk_message": "Prediction service failed to process this request.",
            "risk_summary": "Unexpected model failure.",
            "risk_priority": "Please retry with valid inputs.",
            "readiness_percentage": None,
            "factors": [],
            "explanation": "Explainability unavailable because prediction failed.",
            "advice": "Please retry your request.",
            "warnings": ["PREDICTION_FAILED"],
            "error": str(exc)
        }

    # -------------------------
    # EXPLANATION
    # FIX: only pass (model, features)
    # -------------------------
    explainability_status = "ok"
    try:
        factors = compute_feature_impacts(
            MODEL,
            features
        )
        explanation = generate_explanation(factors)
    except Exception:
        explainability_status = "degraded"
        factors = []
        explanation = "Explainability is temporarily unavailable for this response."

    # -------------------------
    # RISK ENGINE
    # -------------------------
    risk = classify_risk(prediction)

    # -------------------------
    # ADVISOR ENGINE
    # -------------------------
    try:
        advice = generate_advice(
            data=data,
            prediction=prediction,
            risk=risk,
            factors=factors
        )
    except Exception:
        advice = "Focus on contribution consistency and savings growth."

    confidence = round(max(0.0, 1 - abs(prediction - 0.5) * 0.6), 4)
    warnings = []
    if explainability_status != "ok":
        warnings.append("EXPLAINABILITY_DEGRADED")

    # -------------------------
    # RESPONSE
    # -------------------------
    return {
        "status": "ok" if not warnings else "partial",
        "prediction": round(prediction, 4),
        "confidence": confidence,

        "risk": risk["risk"],
        "risk_label": risk["label"],
        "risk_color": risk["color"],
        "risk_message": risk["message"],
        "risk_summary": risk["summary"],
        "risk_priority": risk["priority"],
        "readiness_percentage": risk["percentage"],

        "factors": factors[:5],
        "explanation": explanation,
        "advice": advice,
        "warnings": warnings
    }