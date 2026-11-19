"""
Pydantic Schemas for Trips, Itineraries, Activities, Budget Simulation, and Recovery.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class GroupMemberSchema(BaseModel):
    name: str
    budget: Optional[float] = None
    interests: List[str] = Field(default_factory=list)
    food_preferences: Optional[str] = None
    walking_comfort: Optional[str] = "moderate"


class TripCreate(BaseModel):
    title: Optional[str] = "My Indian Adventure"
    destination: str = Field(..., description="Target city e.g. jaipur, delhi, goa")
    start_date: Optional[str] = "2026-12-01"
    end_date: Optional[str] = "2026-12-04"
    num_days: int = Field(default=3, ge=1, le=14)
    num_travelers: int = Field(default=1, ge=1, le=20)
    travel_type: str = Field(default="solo")   # solo, couple, family, group
    budget: float = Field(default=20000.0, ge=1000.0)
    budget_category: str = Field(default="mid")  # budget, mid, luxury
    interests: List[str] = Field(default_factory=lambda: ["historical", "cultural"])
    food_preferences: Optional[str] = "Local Cuisine"
    dietary_restrictions: List[str] = Field(default_factory=list)
    walking_comfort: str = Field(default="moderate")  # easy, moderate, active
    accessibility_required: bool = False
    transport_preference: str = Field(default="auto")
    group_members: Optional[List[GroupMemberSchema]] = None
    weather: Optional[str] = "sunny"
    search_algorithm: Optional[str] = "astar"


class ActivityResponse(BaseModel):
    slot_label: str
    time_window: str
    attraction_id: str
    name: str
    category: str
    description: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    entry_fee: float
    duration_hours: float
    transit_from_previous_min: int
    distance_from_previous_km: float
    ai_score: float
    ai_explanation: str


class DayMealResponse(BaseModel):
    name: str
    cuisine: str
    avg_cost: float
    dietary: List[str]


class DayPlanResponse(BaseModel):
    day_number: int
    activities: List[ActivityResponse]
    meals: Dict[str, DayMealResponse]


class ItineraryResponse(BaseModel):
    id: Optional[str] = None
    trip_id: Optional[str] = None
    destination: Dict[str, Any]
    trip_params: Dict[str, Any]
    days: List[DayPlanResponse]
    total_estimated_expenditure: float
    cost_breakdown: Dict[str, float]
    budget_utilization_percentage: float
    search_metadata: Optional[Dict[str, Any]] = None
    csp_metadata: Optional[Dict[str, Any]] = None
    agent_logs: Optional[List[Dict[str, Any]]] = None
    peas_framework: Optional[Dict[str, Any]] = None
    pipeline_time_ms: float


class BudgetSimRequest(BaseModel):
    new_budget: float = Field(..., ge=1000.0)


class RecoveryRequest(BaseModel):
    unavailable_attraction_id: str
    reason: str = Field(default="Closed for renovation")

