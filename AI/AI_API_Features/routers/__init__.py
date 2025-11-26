"""Routers module"""
from .food import router as food_router
from .workout import router as workout_router

__all__ = ["food_router", "workout_router"]
