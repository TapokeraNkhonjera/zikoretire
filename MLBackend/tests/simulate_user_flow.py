import sys
import os

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

sys.path.append(BASE_DIR)

from core.predict import predict_readiness

# =========================================================
# SIMULATED USER PROFILE
# =========================================================
user_profile = {
    "age": 35,
    "monthly_income": 250000,
    "monthly_contribution": 40000,
    "current_savings": 1200000,
    "inflation_rate": 9,
    "employment_type": 1,
    "job_stability": 0.7,
    "contribution_gap_months": 2
}

# =========================================================
# RUN ML SYSTEM
# =========================================================
result = predict_readiness(user_profile)

risk = {
    "level": result["risk"],
    "label": result["risk_label"],
    "color": result["risk_color"],
    "message": result["risk_message"],
    "summary": result["risk_summary"],
    "priority": result["risk_priority"],
}

# =========================================================
# FRONTEND-LIKE OUTPUT
# =========================================================
print("\n======================================")
print("📊 AI PENSION READINESS REPORT")
print("======================================\n")

# =========================================================
# USER PROFILE
# =========================================================
print("👤 USER PROFILE")
print("--------------------------------------")

print(f"Age: {user_profile['age']}")
print(f"Monthly Income: MK {user_profile['monthly_income']:,}")
print(f"Monthly Contribution: MK {user_profile['monthly_contribution']:,}")
print(f"Current Savings: MK {user_profile['current_savings']:,}")
print(f"Inflation Rate: {user_profile['inflation_rate']}%")

print()

# =========================================================
# ML RESULTS
# =========================================================
print("🧠 ML PREDICTION")
print("--------------------------------------")

print(f"Readiness Score : {result['prediction']:.3f}")
print(f"Confidence Score: {result['confidence']:.0%}")

print()

# =========================================================
# RISK ANALYSIS
# =========================================================
print("🚨 RISK ANALYSIS")
print("--------------------------------------")

print(f"Risk Level : {risk['level']}")
print(f"Status Color: {risk['color']}")
print(f"Assessment : {risk['message']}")

print()

# =========================================================
# EXPLANATION
# =========================================================
print("🧾 MODEL EXPLANATION")
print("--------------------------------------")
print(result["explanation"])
print()

# =========================================================
# FEATURE IMPACTS
# =========================================================
print("📌 TOP FACTORS")
print("--------------------------------------")

for factor in result["factors"]:
    impact = factor["impact"]

    direction = "Positive" if impact > 0 else "Negative"

    print(
        f"{factor['label']}: "
        f"{direction} ({impact:.4f})"
    )

print()

# =========================================================
# AI ADVISOR
# =========================================================
print("💡 AI FINANCIAL ADVISOR")
print("--------------------------------------")

print(result["advice"])

print("\n======================================\n")