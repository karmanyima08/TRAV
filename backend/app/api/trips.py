"""
Trip Management API Endpoints: Create Trip, Run AI Pipeline, Retrieve Itinerary,
Dynamic Activity Recovery, and Budget Simulation.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any, Optional
from app.schemas.trip import TripCreate, BudgetSimRequest, RecoveryRequest
from app.services.itinerary_service import ItineraryService
from app.services.auth_service import get_current_user, get_optional_current_user

router = APIRouter()
itinerary_service = ItineraryService()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_in: TripCreate,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """Create a new trip specification, associated with user account if signed in."""
    user_id = current_user["id"] if current_user else "guest"
    created = await itinerary_service.create_trip(trip_in.dict(), user_id)
    return created


@router.get("")
async def list_trips(current_user: dict = Depends(get_current_user)):
    """List all saved itineraries for the currently authenticated account."""
    trips = await itinerary_service.list_user_trips(current_user["id"])
    return trips


@router.get("/{trip_id}")
async def get_trip(
    trip_id: str,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """Get trip details and saved itinerary."""
    trip = await itinerary_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    return trip


@router.delete("/{trip_id}")
async def delete_trip(
    trip_id: str,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """Delete a trip."""
    success = await itinerary_service.delete_trip(trip_id)
    if not success:
        raise HTTPException(status_code=404, detail="Trip not found.")
    return {"message": "Trip successfully deleted."}


@router.post("/{trip_id}/generate")
async def generate_itinerary(
    trip_id: str,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Trigger the complete Multi-Agent AI Pipeline:
    DestinationResearchAgent -> UserPreferenceAgent -> ItineraryPlanningAgent (A*) ->
    ConstraintValidationAgent (CSP) -> OptimizationRecoveryAgent.
    """
    try:
        itinerary = await itinerary_service.generate_itinerary(trip_id)
        # If user is authenticated, ensure trip is attached to their account
        if current_user:
            trip = await itinerary_service.get_trip(trip_id)
            if trip:
                trip["user_id"] = current_user["id"]
        return itinerary
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Engine synthesis error: {str(e)}")


@router.get("/{trip_id}/itinerary")
async def get_itinerary(
    trip_id: str,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """Retrieve generated itinerary for a trip."""
    trip = await itinerary_service.get_trip(trip_id)
    if not trip or not trip.get("itinerary"):
        raise HTTPException(status_code=404, detail="Itinerary not generated yet.")
    return trip["itinerary"]


@router.post("/{trip_id}/budget-simulate")
async def budget_simulate(
    trip_id: str,
    req: BudgetSimRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Budget What-If Simulator:
    Recalculates attraction tiers, accommodation, and food allocations
    under new budget constraints and compares original vs modified.
    """
    try:
        comparison = await itinerary_service.simulate_budget(trip_id, req.new_budget)
        return comparison
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{trip_id}/activity/{activity_id}/recover")
async def recover_activity(
    trip_id: str,
    activity_id: str,
    req: RecoveryRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Dynamic Itinerary Recovery:
    Replaces an unavailable/weather-affected attraction with an optimal alternative
    while strictly preserving unaffected days and activities.
    """
    try:
        result = await itinerary_service.recover_activity(trip_id, activity_id, req.reason)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
