import numpy as np

from core.features import FEATURES
from core.labels import FEATURE_LABELS

try:
    import shap
except Exception:
    shap = None

# =========================================================
# SHAP CACHE
# =========================================================
_EXPLAINER_CACHE = {}


# =========================================================
# EXPLAINER BUILDER
# =========================================================
def get_explainer(model, background):
    model_id = f"{type(model).__name__}:{id(model)}"

    if model_id in _EXPLAINER_CACHE:
        return _EXPLAINER_CACHE[model_id]

    if shap is None:
        raise RuntimeError("SHAP is not installed")

    # Tree models (BEST)
    if hasattr(model, "feature_importances_"):
        explainer = shap.TreeExplainer(model)

    # Linear models
    elif hasattr(model, "coef_"):
        explainer = shap.LinearExplainer(model, background)

    # Fallback (slow but safe)
    else:
        explainer = shap.KernelExplainer(model.predict, background)

    _EXPLAINER_CACHE[model_id] = explainer
    return explainer


# =========================================================
# FEATURE IMPACT ENGINE (FIXED)
# =========================================================
def compute_feature_impacts(model, input_features, background_data=None):
    x = np.array(input_features, dtype=float).reshape(1, -1)

    if background_data is None:
        background_data = np.zeros((1, len(FEATURES)), dtype=float)

    try:
        explainer = get_explainer(model, background_data)
        shap_values = explainer.shap_values(x)

        if isinstance(shap_values, list):
            shap_values = shap_values[0]

        shap_values = np.array(shap_values)[0]

        scale = np.mean(np.abs(shap_values))
        scale = scale if scale != 0 else 1.0

        impacts = []
        for i, feature in enumerate(FEATURES):
            value = input_features[i]
            shap_score = float(shap_values[i])
            normalized = shap_score / scale
            impacts.append({
                "feature": feature,
                "label": FEATURE_LABELS.get(feature, feature),
                "impact": round(normalized, 4),
                "raw_shap": round(shap_score, 6),
                "value": round(float(value), 2) if isinstance(value, (int, float, np.number)) else value
            })

        impacts.sort(key=lambda impact: abs(impact["impact"]), reverse=True)
        return impacts
    except Exception:
        # Safe fallback: still provide deterministic factors if SHAP fails.
        return _fallback_impacts(input_features)


def _fallback_impacts(input_features):
    numeric_values = np.array(input_features, dtype=float)
    scale = float(np.mean(np.abs(numeric_values))) or 1.0

    impacts = []
    for i, feature in enumerate(FEATURES):
        value = float(numeric_values[i])
        impacts.append({
            "feature": feature,
            "label": FEATURE_LABELS.get(feature, feature),
            "impact": round(value / scale, 4),
            "raw_shap": 0.0,
            "value": round(value, 2)
        })

    impacts.sort(key=lambda impact: abs(impact["impact"]), reverse=True)
    return impacts


# =========================================================
# HUMAN EXPLANATION (FIXED + LESS FLAT)
# =========================================================
def generate_explanation(factors):

    top = factors[:5]

    positive = [f for f in top if f["impact"] > 0.05]
    negative = [f for f in top if f["impact"] < -0.05]

    strongest = top[0] if top else None

    parts = []

    # =====================================================
    # GLOBAL INTERPRETATION (IMPORTANT FIX)
    # =====================================================
    if strongest:

        if strongest["impact"] > 0.2:
            parts.append(
                f"Your retirement outlook is strongly supported by {strongest['label']}."
            )

        elif strongest["impact"] < -0.2:
            parts.append(
                f"Your retirement outlook is being significantly held back by {strongest['label']}."
            )

        else:
            parts.append(
                "Your financial profile shows mixed but moderate influence across factors."
            )

    # =====================================================
    # POSITIVE DRIVERS
    # =====================================================
    if positive:
        parts.append(
            "Positive influences are coming from " +
            ", ".join(f["label"] for f in positive)
        )

    # =====================================================
    # NEGATIVE DRIVERS
    # =====================================================
    if negative:
        parts.append(
            "Key pressure points include " +
            ", ".join(f["label"] for f in negative)
        )

    # =====================================================
    # FALLBACK
    # =====================================================
    if not parts:
        return "Your financial drivers are balanced with no dominant influence detected."

    return ". ".join(parts) + "."