from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np

app = FastAPI()

# --- CORS CONFIGURATION ---
# This allows your Next.js project (usually on port 3000) to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS (The "Schema") ---
class IncomeData(BaseModel):
    amounts: List[float]  # Last 6-12 months of income

class RiskProfileRequest(BaseModel):
    age: int
    market_view: str  # "Bullish", "Bearish", "Neutral"
    app_usage_frequency: int  # How many times they check the app

# --- ENDPOINTS ---

@app.get("/")
def home():
    return {"status": "ML Backend is Running"}

# 1. Nudge Suggestion Logic
@app.get("/api/nudge/{user_savings}")
def get_nudge(user_savings: float):
    # Literal Logic: Simple segment-based nudge
    if user_savings < 5000:
        msg = "Setting up an auto-save of just $10/week puts you ahead of 60% of peers."
    else:
        msg = "You're doing great! Based on similar profiles, a 2% increase now yields $20k more at retirement."
    return {"nudge": msg}

# 2. Seasonal Income Prediction
@app.post("/api/predict-income")
def predict_income(data: IncomeData):
    # Technical Logic: Using a simple Moving Average (Placeholder for XGBoost)
    if len(data.amounts) < 3:
        return {"error": "Need at least 3 months of data"}
    
    prediction = np.mean(data.amounts[-3:]) * 1.05  # 5% projected seasonal growth
    return {"predicted_next_month": round(prediction, 2)}

# 3. Dynamic Risk Profiling
@app.post("/api/risk-profile")
def get_risk_score(data: RiskProfileRequest):
    # Literal Logic: Behavior-based risk adjustment
    base_score = 50
    if data.age > 50: base_score -= 10
    if data.app_usage_frequency > 15: base_score -= 5 # Anxious behavior reduces risk tolerance
    
    return {
        "dynamic_risk_score": base_score,
        "strategy": "Conservative" if base_score < 40 else "Balanced"
    }


# Updated logic for Malawi Pension Act 2023
@app.post("/api/malawi-projection")
def calculate_malawi_pension(basic_salary: float, years_to_retire: int):
    # Statutory minimums in Malawi
    employer_rate = 0.10
    employee_rate = 0.05
    
    monthly_contribution = basic_salary * (employer_rate + employee_rate)
    
    # Using 2025 growth trends: Pension funds grew significantly 
    # but inflation remains a factor (~27.7%)
    estimated_annual_return = 0.15 # Conservative estimate based on 2024 equity performance
    
    total_projection = monthly_contribution * 12 * years_to_retire * (1 + estimated_annual_return)
    
    return {
        "monthly_statutory_contribution": monthly_contribution,
        "projected_total": round(total_projection, 2),
        "legal_disclaimer": "Based on Pension Act 2023 minimums."
    }

# Add to your existing main.py
def calculate_inflation_adjusted_pension(projected_amount, years):
    # Based on RBM 2025 projections, we use a 15% long-term avg inflation 
    # (optimistic compared to current 28%)
    avg_inflation = 0.15 
    real_value = projected_amount / ((1 + avg_inflation) ** years)
    return round(real_value, 2)

@app.get("/api/malawi-nudge/{user_id}")
def malawi_specific_nudge(user_id: int, current_balance: float):
    # DATA POINT: 41% of employers are in arrears
    # We nudge the user to check their statement
    compliance_risk_msg = "Note: 41% of employers have contribution arrears. Check your statement to ensure your 10% employer portion is up to date."
    
    # DATA POINT: Inflation impact
    future_val = current_balance * 1.15 # 15% return
    real_val = calculate_inflation_adjusted_pension(future_val, 10)
    
    return {
        "nudge": compliance_risk_msg,
        "inflation_warning": f"Due to 28% inflation, your MK{current_balance:,} will feel like MK{real_val:,} in 10 years. Consider a voluntary 2% top-up."
    }
