from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.readiness import router as readiness_router

app = FastAPI(title="ZikoML Engine")

# CORS (connect to Next.js later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(readiness_router, prefix="/api")

@app.get("/")
def root():
    return {
        "status": "online",
        "engine": "ZikoML v2",
        "modules": ["readiness"]
    }