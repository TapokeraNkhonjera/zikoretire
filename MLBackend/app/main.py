import uuid
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.routes.readiness import router as readiness_router
from app.routes.telemetry import router as telemetry_router
from app.routes.training import router as training_router
from app.routes.multi_predict import router as multi_predict_router

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
app.include_router(telemetry_router, prefix="/api")
app.include_router(training_router, prefix="/api")
app.include_router(multi_predict_router, prefix="/api")


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = request_id

    try:
        response = await call_next(request)
    except Exception:
        return JSONResponse(
            status_code=500,
            content={
                "status": "degraded",
                "error": "UNHANDLED_SERVER_ERROR",
                "message": "The server encountered an unexpected error.",
                "request_id": request_id
            },
        )

    response.headers["x-request-id"] = request_id
    return response

@app.get("/")
def root():
    return {
        "status": "online",
        "engine": "ZikoML v3",
        "modules": ["readiness", "telemetry", "training", "multi_predict"]
    }