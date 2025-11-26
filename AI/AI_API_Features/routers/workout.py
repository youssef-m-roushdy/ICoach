"""
Workout API Router
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import pandas as pd
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/workout", tags=["workout"])

# Load CSV data once when module is imported
CSV_PATH = Path(__file__).parent.parent.parent / "workout_training_feature" / "body_parts_final.csv"

try:
    # Load and clean the data
    df = pd.read_csv(CSV_PATH)
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
    logger.info(f"✅ Loaded workout data: {len(df)} exercises from {CSV_PATH}")
except Exception as e:
    logger.error(f"❌ Failed to load workout data: {e}")
    df = None


@router.get("/health")
async def workout_health():
    """Health check for workout API"""
    if df is not None:
        return {
            "status": "healthy",
            "total_exercises": len(df),
            "body_parts": df['body_part'].unique().tolist() if 'body_part' in df.columns else [],
            "csv_loaded": True
        }
    return {
        "status": "unhealthy",
        "error": "CSV data not loaded",
        "csv_loaded": False
    }


@router.get("/exercises")
async def get_exercises(
    body_part: Optional[str] = Query(None, description="Filter by body part (e.g., chest, back, legs)"),
    target_area: Optional[str] = Query(None, description="Filter by target area"),
    level: Optional[str] = Query(None, description="Filter by difficulty level (beginner, intermediate, advanced)"),
    page: int = Query(1, ge=1, description="Page number (starting from 1)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page (max 100)")
):
    """
    Get workout exercises with optional filters and pagination
    
    - **body_part**: Filter by body part (chest, back, legs, etc.)
    - **target_area**: Filter by specific target area
    - **level**: Filter by difficulty level
    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 20, max: 100)
    """
    if df is None:
        raise HTTPException(status_code=500, detail="Workout data not loaded")
    
    # Start with full dataset
    filtered_df = df.copy()
    
    # Apply filters
    filters_applied = []
    
    if body_part:
        if 'body_part' not in df.columns:
            raise HTTPException(status_code=400, detail="body_part column not found in data")
        filtered_df = filtered_df[filtered_df['body_part'].str.lower() == body_part.lower()]
        filters_applied.append(f"body_part={body_part}")
    
    if target_area:
        if 'target_area' not in df.columns:
            raise HTTPException(status_code=400, detail="target_area column not found in data")
        filtered_df = filtered_df[filtered_df['target_area'].str.lower() == target_area.lower()]
        filters_applied.append(f"target_area={target_area}")
    
    if level:
        if 'level' not in df.columns:
            raise HTTPException(status_code=400, detail="level column not found in data")
        filtered_df = filtered_df[filtered_df['level'].str.lower() == level.lower()]
        filters_applied.append(f"level={level}")
    
    # Calculate pagination
    total_items = len(filtered_df)
    total_pages = (total_items + page_size - 1) // page_size  # Ceiling division
    
    # Validate page number
    if page > total_pages and total_items > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Page {page} does not exist. Total pages: {total_pages}"
        )
    
    # Apply pagination
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_df = filtered_df.iloc[start_idx:end_idx]
    
    # Convert to list of dictionaries
    exercises = paginated_df.to_dict('records')
    
    return {
        "success": True,
        "pagination": {
            "current_page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_previous": page > 1
        },
        "filters_applied": filters_applied,
        "exercises": exercises
    }


@router.get("/exercise/{exercise_id}")
async def get_exercise_by_id(exercise_id: int):
    """
    Get a specific exercise by ID
    
    - **exercise_id**: The ID of the exercise
    """
    if df is None:
        raise HTTPException(status_code=500, detail="Workout data not loaded")
    
    if 'id' not in df.columns:
        raise HTTPException(status_code=400, detail="id column not found in data")
    
    exercise = df[df['id'] == exercise_id]
    
    if exercise.empty:
        raise HTTPException(status_code=404, detail=f"Exercise with ID {exercise_id} not found")
    
    return {
        "success": True,
        "exercise": exercise.to_dict('records')[0]
    }


@router.get("/body-parts")
async def get_body_parts():
    """Get list of all available body parts"""
    if df is None:
        raise HTTPException(status_code=500, detail="Workout data not loaded")
    
    if 'body_part' not in df.columns:
        raise HTTPException(status_code=400, detail="body_part column not found in data")
    
    body_parts = df['body_part'].unique().tolist()
    
    return {
        "success": True,
        "body_parts": body_parts,
        "count": len(body_parts)
    }


@router.get("/target-areas")
async def get_target_areas(body_part: Optional[str] = Query(None, description="Filter target areas by body part")):
    """Get list of all available target areas, optionally filtered by body part"""
    if df is None:
        raise HTTPException(status_code=500, detail="Workout data not loaded")
    
    if 'target_area' not in df.columns:
        raise HTTPException(status_code=400, detail="target_area column not found in data")
    
    filtered_df = df
    
    if body_part:
        if 'body_part' not in df.columns:
            raise HTTPException(status_code=400, detail="body_part column not found in data")
        filtered_df = df[df['body_part'].str.lower() == body_part.lower()]
    
    target_areas = filtered_df['target_area'].unique().tolist()
    
    return {
        "success": True,
        "target_areas": target_areas,
        "count": len(target_areas),
        "body_part_filter": body_part
    }


@router.get("/levels")
async def get_levels():
    """Get list of all available difficulty levels"""
    if df is None:
        raise HTTPException(status_code=500, detail="Workout data not loaded")
    
    if 'level' not in df.columns:
        raise HTTPException(status_code=400, detail="level column not found in data")
    
    levels = df['level'].unique().tolist()
    
    return {
        "success": True,
        "levels": levels,
        "count": len(levels)
    }
