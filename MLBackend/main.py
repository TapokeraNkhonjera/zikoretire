import os
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LOAD ZIKOML BRAIN ---
# Using absolute paths to prevent "File Not Found" errors
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "income_model.pkl")

try:
    ziko_brain = joblib.load(MODEL_PATH)
    print(f"ZikoML: Brain successfully loaded from {MODEL_PATH}")
except Exception as e:
    ziko_brain = None
    print(f"ZikoML ERROR: Could not load model. Please run train_model.py. Details: {e}")

# --- DATA MODELS ---
class IncomeRequest(BaseModel):
    month_number: int

# --- ENDPOINTS ---

@app.get("/")
def health_check():
    return {
        "status": "Online",
        "engine": "ZikoML",
        "model_ready": ziko_brain is not None
    }

@app.post("/api/predict-income")
def predict_income(data: IncomeRequest):
    if not ziko_brain:
        raise HTTPException(status_code=503, detail="Brain not loaded")
    
    try:
        # Scikit-learn expects a 2D array: [[value]]
        # Using a list instead of np.array can sometimes be more stable for simple inputs
        prediction_raw = ziko_brain.predict([[data.month_number]])
        
        # Ensure we extract the first value and convert to standard float
        predicted_value = float(prediction_raw[0])
        
        return {
            "predicted_income": round(predicted_value, 2),
            "currency": "MWK",
            "engine": "ZikoML"
        }
    except Exception as e:
        # This will print the exact reason for the 500 error in your terminal
        print(f"CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
