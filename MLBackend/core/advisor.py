from core.labels import FEATURE_LABELS


# =========================================================
# FEATURE-BASED ACTION INSIGHTS
# =========================================================
FEATURE_ADVICE = {
    "monthly_income":
        "Increasing income stability and growth will strengthen long-term retirement capacity.",

    "monthly_contribution":
        "Consistently increasing pension contributions will significantly improve retirement outcomes.",

    "current_savings":
        "Building stronger savings reserves improves financial resilience and reduces retirement risk.",

    "inflation_rate":
        "Managing inflation exposure through consistent investing helps preserve long-term purchasing power.",

    "employment_type":
        "More stable employment structures improve predictability of long-term contributions.",

    "job_stability":
        "Strengthening job consistency improves reliability of retirement planning.",

    "contribution_gap_months":
        "Reducing gaps in contributions can significantly improve retirement readiness.",

    "age":
        "As retirement approaches, maintaining consistency becomes increasingly important."
}


# =========================================================
# MAIN ADVISOR ENGINE
# =========================================================
def generate_advice(
    data: dict,
    prediction: float,
    risk: dict,
    factors: list
):

    top = factors[:4]

    positives = [f for f in top if f["impact"] > 0]
    negatives = [f for f in top if f["impact"] < 0]

    parts = []

    # =====================================================
    # RISK CONTEXT
    # =====================================================
    if risk["risk"] == "HIGH":
        parts.append(
            "Your retirement profile indicates elevated financial risk and may require immediate corrective action."
        )

    elif risk["risk"] == "MEDIUM":
        parts.append(
            "Your retirement readiness is developing, but there are still meaningful areas that need improvement."
        )

    else:
        parts.append(
            "Your retirement position is currently stable with several positive financial indicators."
        )

    # =====================================================
    # POSITIVE DRIVERS
    # =====================================================
    if positives:

        labels = [
            f["label"]
            for f in positives
        ]

        parts.append(
            "Positive factors supporting your outlook include " +
            ", ".join(labels) + "."
        )

    # =====================================================
    # NEGATIVE DRIVERS
    # =====================================================
    if negatives:

        labels = [
            f["label"]
            for f in negatives
        ]

        parts.append(
            "Key pressure points affecting your readiness include " +
            ", ".join(labels) + "."
        )

    # =====================================================
    # ACTIONABLE RECOMMENDATIONS
    # =====================================================
    actions = []

    for f in negatives:

        feature = f["feature"]

        if feature in FEATURE_ADVICE:
            actions.append(FEATURE_ADVICE[feature])

    actions = actions[:2]

    if actions:
        parts.append(
            "Recommended actions: " + " ".join(actions)
        )

    # =====================================================
    # FUTURE GUIDANCE TONE
    # =====================================================
    if prediction >= 0.7:

        parts.append(
            "Maintaining disciplined financial habits will be key to sustaining this strong trajectory."
        )

    elif prediction >= 0.4:

        parts.append(
            "Small, consistent financial improvements can significantly enhance long-term retirement stability."
        )

    else:

        parts.append(
            "Early financial adjustments and stronger contribution discipline are strongly recommended to improve future outcomes."
        )

    # =====================================================
    # FINAL OUTPUT
    # =====================================================
    return " ".join(parts)