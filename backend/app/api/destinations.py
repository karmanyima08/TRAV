"""
Destination and Point of Interest API Endpoints.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.ai_engine.knowledge_base.facts import DESTINATIONS, ATTRACTIONS, RESTAURANTS

router = APIRouter()


@router.get("")
async def list_destinations(search: Optional[str] = Query(None)):
    """Retrieve catalog of all supported destinations."""
    items = list(DESTINATIONS.values())
    if search:
        s = search.lower().strip()
        items = [d for d in items if s in d["name"].lower() or s in d["state"].lower()]
    return items


@router.get("/{destination_id}")
async def get_destination(destination_id: str):
    """Retrieve a single destination by ID."""
    dest = DESTINATIONS.get(destination_id.lower())
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found.")
    return dest


@router.get("/{destination_id}/attractions")
async def get_attractions(destination_id: str, category: Optional[str] = None):
    """Retrieve attractions and points of interest for a destination."""
    items = [a for a in ATTRACTIONS if a["destination_id"] == destination_id.lower()]
    if category:
        items = [a for a in items if a.get("category") == category.lower()]
    return items


@router.get("/{destination_id}/restaurants")
async def get_restaurants(destination_id: str):
    """Retrieve dining recommendations for a destination."""
    items = [r for r in RESTAURANTS if r["destination_id"] == destination_id.lower()]
    return items

