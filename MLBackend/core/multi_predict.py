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

MODEL_PATHS = {
    'readiness': os.path.join(BASE_DIR, "models", "latest", "readiness_model.pkl"),
    'consistency': os.path.join(BASE_DIR, "models", "latest", "consistency_model.pkl"),
    'volatility': os.path.join(BASE_DIR, "models", "latest", "volatility_model.pkl"),
    'sustainability': os.path.join(BASE_DIR, "models", "latest", "sustainability_model.pkl"),
    'inflation_vulnerability': os.path.join(BASE_DIR, "models", "latest", "inflation_model.pkl")
}

MODELS = {}
MODEL_LOAD_ERRORS = {}

for model_type, path in MODEL_PATHS.items():
    try:
        MODELS[model_type] = joblib.load(path)
        MODEL_LOAD_ERRORS[model_type] = None
    except Exception as exc:
        MODELS[model_type] = None
        MODEL_LOAD_ERRORS[model_type] = str(exc)

def get_engine_status():
    return {
        "models_loaded": {k: v is not None for k, v in MODELS.items()},
        "model_paths": MODEL_PATHS,
        "model_errors": MODEL_LOAD_ERRORS
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
# SINGLE PREDICTION WITH EXPLAINABILITY
# =========================================================
def predict_with_explainability(model_type: str, data: dict):
    model = MODELS.get(model_type)
    if model is None:
        return {
            "prediction": None,
            "confidence": 0.0,
            "factors": [],
            "explanation": f"Model unavailable for {model_type} prediction.",
            "error": MODEL_LOAD_ERRORS.get(model_type, "Unknown error")
        }
    
    try:
        features = build_features(data)
        X_input = pd.DataFrame([features], columns=FEATURES)
        
        # Prediction
        raw_prediction = model.predict(X_input)[0]
        prediction = float(np.clip(raw_prediction, 0, 1))
        
        # Explainability
        factors = []
        explanation = f"Explainability unavailable for {model_type} model."
        
        try:
            factors = compute_feature_impacts(model, features)
            explanation = generate_explanation(factors, model_type)
        except Exception as exc:
            print(f"Explainability failed for {model_type}: {exc}")
        
        # Confidence calculation
        confidence = round(max(0.0, 1 - abs(prediction - 0.5) * 0.6), 4)
        
        return {
            "prediction": round(prediction, 4),
            "confidence": confidence,
            "factors": factors[:5],
            "explanation": explanation,
            "error": None
        }
        
    except Exception as exc:
        return {
            "prediction": None,
            "confidence": 0.0,
            "factors": [],
            "explanation": f"Prediction failed for {model_type}.",
            "error": str(exc)
        }

# =========================================================
# MULTI-OUTPUT PREDICTION ENGINE
# =========================================================
def predict_all_outputs(data: dict):
    outputs = {}
    overall_warnings = []
    
    # Predict all 5 outputs
    for model_type in ['readiness', 'consistency', 'volatility', 'sustainability', 'inflation_vulnerability']:
        result = predict_with_explainability(model_type, data)
        outputs[model_type] = result
        
        if result["error"]:
            overall_warnings.append(f"{model_type.upper()}_MODEL_ERROR")
    
    # Calculate overall confidence (average of available predictions)
    available_confidences = [r["confidence"] for r in outputs.values() if r["confidence"] > 0]
    overall_confidence = np.mean(available_confidences) if available_confidences else 0.0
    
    # Generate overall status
    failed_models = sum(1 for r in outputs.values() if r["error"])
    if failed_models == 0:
        overall_status = "ok"
    elif failed_models <= 2:
        overall_status = "partial"
    else:
        overall_status = "degraded"
    
    return {
        "status": overall_status,
        "overall_confidence": round(overall_confidence, 4),
        "outputs": outputs,
        "warnings": overall_warnings,
        "model_status": get_engine_status()
    }
