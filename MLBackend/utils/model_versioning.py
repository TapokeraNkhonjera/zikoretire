import os
import joblib
from datetime import datetime
from config import LATEST_MODEL_PATH, VERSIONED_MODEL_DIR

def save_model(model, metrics):
    os.makedirs(VERSIONED_MODEL_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(LATEST_MODEL_PATH), exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    version_path = os.path.join(
        VERSIONED_MODEL_DIR,
        f"model_{timestamp}.pkl"
    )

    # Save versioned model
    joblib.dump(model, version_path)

    # Save latest model
    joblib.dump(model, LATEST_MODEL_PATH)

    return {
        "latest": LATEST_MODEL_PATH,
        "versioned": version_path,
        "timestamp": timestamp,
        "metrics": metrics
    }