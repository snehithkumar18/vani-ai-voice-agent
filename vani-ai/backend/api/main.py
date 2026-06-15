import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables
load_dotenv(".env")

app = FastAPI(
    title="Vani AI Voice Agent API Backend",
    description="Multi-tenant Voice Agent FastAPI backend for Plivo webhooks and LiveKit dispatching.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
from api.dispatch import router as dispatch_router
from api.webhook import router as webhook_router

app.include_router(dispatch_router, prefix="/api", tags=["Dispatch"])
app.include_router(webhook_router, prefix="/api/webhook", tags=["Webhook"])

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Vani AI Voice Platform Backend"}

if __name__ == "__main__":
    port = int(os.getenv("API_PORT", "8000"))
    uvicorn.run("api.main:app", host="0.0.0.0", port=port, reload=False)
