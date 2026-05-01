# ZikoML: The Intelligence Engine for ZikoRetire

ZikoML is the Machine Learning core of the ZikoRetire platform. It provides personalized pension projections, behavioral nudges, and risk profiling tailored for the Malawian economic landscape (aligned with the Pension Act 2023).

## 🚀 System Capabilities

### 1. Predictive Growth Modeling
ZikoML analyzes pension data across three primary risk/investment models:
*   **Stable:** Low-risk, capital preservation focus.
*   **Balanced:** Medium-risk, diversified growth.
*   **High:** Aggressive growth, high equity exposure.

### 2. Income & Contribution Analytics
The engine is trained to recognize and project based on specific income patterns:
*   **Income Types:** Stable (Salaried), Flexible (Gig/Contract), and Seasonal (Freelance/Agriculture).
*   **Savings Behaviors:** Consistent, Flexible, and Opportunistic.
*   **Irregular Computation:** Capable of identifying patterns in non-standard contribution histories to provide realistic future valuations.

### 3. Behavioral Nudge & Recommendation System
ZikoML acts as a virtual financial advisor by:
*   **Motivation:** Encouraging users who are on track to meet their goals.
*   **Nudges:** Providing actionable advice (e.g., suggesting a 2% increase in monthly contributions).
*   **Contextual Advice:** Recommending shifts in savings behavior based on income type (e.g., advising a seasonal worker to save more during peak periods to cover off-seasons).

---

## 🛠 Tech Stack & Requirements

*   **Language:** Python 3.10+
*   **Framework:** FastAPI (High-performance API)
*   **ML Libraries:** Scikit-Learn, Pandas, NumPy
*   **Deployment:** Uvicorn (ASGI Server)

---

## ⚙️ Setup Instructions

### 1. Environment Setup
Navigate to the `MLBackend` directory and create a virtual environment:
```powershell
# Create environment
py -m venv venv

# Activate environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
Install the required packages listed in `requirements.txt`:
```powershell
pip install -r requirements.txt
```

### 3. Training the Models
Before running the API, you must generate the trained model files (`.pkl`):
```powershell
py train_model.py
```

### 4. Running the Engine
Start the FastAPI server with auto-reload enabled:
```powershell
py -m uvicorn main:app --reload
```
The engine will be available at `http://127.0.0.1:8000`. You can view the interactive API documentation at `/docs`.

---

## 📂 Project Structure
*   `main.py`: The API entry point and inference logic.
*   `train_model.py`: Script to train and save ML models.
*   `income_model.pkl`: The saved "brain" used for predictions.
*   `requirements.txt`: List of Python dependencies.

---
**Note:** All financial projections are adjusted for Malawian inflation rates (~28% as of 2025) and statutory requirements under the Malawi Pension Act.
