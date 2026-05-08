import os

BASE_DIR = os.path.dirname(__file__)

DATA_PATH = os.path.join(BASE_DIR, "data", "data.csv")

MODEL_DIR = os.path.join(BASE_DIR, "models")
LATEST_MODEL_PATH = os.path.join(MODEL_DIR, "latest", "model.pkl")
VERSIONED_MODEL_DIR = os.path.join(MODEL_DIR, "versions")