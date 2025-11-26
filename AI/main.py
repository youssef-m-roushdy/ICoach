"""
Food Recognition API - Main Application
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from AI_API_Features.config import get_settings
from AI_API_Features.routers import food_router, workout_router
from AI_API_Features.services import get_model

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Reduce watchfiles logging noise
logging.getLogger("watchfiles").setLevel(logging.WARNING)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    # Print banner with documentation links
    print("\n" + "="*60)
    print("🍔 Food Recognition API")
    print("="*60)
    print(f"📍 Server: http://{settings.HOST}:{settings.PORT}")
    print(f"📚 API Docs: http://localhost:{settings.PORT}/docs")
    print(f"📖 ReDoc: http://localhost:{settings.PORT}/redoc")
    print("="*60 + "\n")
    
    logger.info("Starting Food Recognition API...")
    logger.info(f"API Version: {settings.API_VERSION}")
    logger.info(f"Debug Mode: {settings.DEBUG}")
    
    # Load ML model
    try:
        logger.info("Loading ML model...")
        model = get_model(
            settings.MODEL_PATH,
            settings.CLASS_NAMES_PATH,
            settings.IMG_SIZE
        )
        if model.is_loaded():
            logger.info("✅ ML model loaded successfully")
        else:
            logger.error("❌ ML model failed to load")
    except Exception as e:
        logger.error(f"❌ Error loading ML model: {e}")
    
    logger.info("Food Recognition API started successfully")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Food Recognition API...")


# Include routers
app.include_router(food_router)
app.include_router(workout_router)


# Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*60)
    print("🍔 Food Recognition API")
    print("="*60)
    print(f"📍 Server: http://{settings.HOST}:{settings.PORT}")
    print(f"📚 API Docs: http://localhost:{settings.PORT}/docs")
    print(f"📖 ReDoc: http://localhost:{settings.PORT}/redoc")
    print("="*60 + "\n")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False,  # Disable auto-reload to avoid constant file watching
        log_level="info"
    )
