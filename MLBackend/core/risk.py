# =========================================================
# RISK CONFIGURATION
# =========================================================
RISK_LEVELS = {
    "LOW": {
        "color": "green",
        "label": "Low Risk",
        "message":
            "Your retirement outlook is strong and financially stable for long-term planning.",

        "summary":
            "Healthy retirement readiness indicators detected.",

        "priority":
            "Maintain consistency in contributions and savings behavior."
    },

    "MEDIUM": {
        "color": "yellow",
        "label": "Moderate Risk",
        "message":
            "Your retirement readiness shows stability but includes areas that need improvement.",

        "summary":
            "Mixed financial signals with room for improvement.",

        "priority":
            "Focus on improving contribution consistency and savings growth."
    },

    "HIGH": {
        "color": "red",
        "label": "High Risk",
        "message":
            "Your retirement readiness indicates elevated financial risk if current patterns continue.",

        "summary":
            "Key financial vulnerabilities detected in retirement profile.",

        "priority":
            "Immediate financial adjustments and stronger savings discipline are recommended."
    }
}


# =========================================================
# RISK ENGINE
# =========================================================
def classify_risk(readiness_score: float):
    """
    Converts ML readiness score into structured pension risk output.
    """

    # -------------------------
    # SAFETY NORMALIZATION
    # -------------------------
    try:
        score = float(readiness_score)
    except (TypeError, ValueError):
        score = 0.0

    score = max(0.0, min(1.0, score))

    # -------------------------
    # CLASSIFICATION
    # -------------------------
    if score >= 0.70:
        risk_key = "LOW"

    elif score >= 0.40:
        risk_key = "MEDIUM"

    else:
        risk_key = "HIGH"

    risk_data = RISK_LEVELS[risk_key]

    # -------------------------
    # FINAL RESPONSE (FRONTEND SAFE)
    # -------------------------
    return {
        # core
        "score": round(score, 4),
        "percentage": round(score * 100, 1),

        # classification
        "risk": risk_key,
        "risk_level": risk_key,

        # UI fields (IMPORTANT consistency)
        "label": risk_data["label"],
        "color": risk_data["color"],
        "message": risk_data["message"],
        "summary": risk_data["summary"],
        "priority": risk_data["priority"],

        # optional explicit frontend aliases (safe redundancy)
        "risk_label": risk_data["label"],
        "risk_color": risk_data["color"],
        "risk_message": risk_data["message"]
    }