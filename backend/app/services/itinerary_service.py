"""
Itinerary Service: Manages trip persistence, executes agent pipelines,
handles budget what-if recalculations, group preference balancing, and dynamic recovery.
"""

from typing import Dict, List, Any, Optional
import uuid
import time
from app.agents.coordinator import AgentCoordinator
from app.ai_engine.knowledge_base.facts import ATTRACTIONS, DESTINATIONS, RESTAURANTS
from app.database.connection import get_database

# In-memory trip repository with dual-storage (fallback if MongoDB connection is unavailable)
IN_MEMORY_TRIPS: Dict[str, Dict[str, Any]] = {}


class ItineraryService:
    """Service layer for Trip management and AI orchestration."""

    def __init__(self):
        self.coordinator = AgentCoordinator()

    async def create_trip(self, trip_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create new trip profile and persist it."""
        trip_id = f"trip_{uuid.uuid4().hex[:12]}"
        created_trip = {
            "id": trip_id,
            "user_id": user_id,
            "title": trip_data.get("title", f"Trip to {trip_data.get('destination', 'India').capitalize()}"),
            "destination": trip_data.get("destination", "jaipur").lower(),
            "params": trip_data,
            "created_at": time.time(),
            "status": "created",
            "itinerary": None
        }

        IN_MEMORY_TRIPS[trip_id] = created_trip

        # Sync with MongoDB if connected
        try:
            db = get_database()
            if db is not None:
                await db["trips"].insert_one(dict(created_trip))
        except Exception:
            pass

        return created_trip

    async def generate_itinerary(self, trip_id: str) -> Dict[str, Any]:
        """Run the full AI multi-agent pipeline to generate an itinerary."""
        trip = IN_MEMORY_TRIPS.get(trip_id)
        if not trip:
            # Check MongoDB
            try:
                db = get_database()
                if db is not None:
                    db_trip = await db["trips"].find_one({"id": trip_id})
                    if db_trip:
                        trip = db_trip
                        IN_MEMORY_TRIPS[trip_id] = db_trip
            except Exception:
                pass

        if not trip:
            raise ValueError(f"Trip with ID {trip_id} not found.")

        # Execute Multi-Agent Pipeline
        pipeline_output = self.coordinator.run_pipeline(trip["params"])
        pipeline_output["trip_id"] = trip_id
        pipeline_output["id"] = f"itin_{uuid.uuid4().hex[:8]}"

        trip["itinerary"] = pipeline_output
        trip["status"] = "generated"

        # Update MongoDB if available
        try:
            db = get_database()
            if db is not None:
                await db["trips"].update_one({"id": trip_id}, {"$set": {"itinerary": pipeline_output, "status": "generated"}})
        except Exception:
            pass

        return pipeline_output

    async def get_trip(self, trip_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve trip by ID."""
        trip = IN_MEMORY_TRIPS.get(trip_id)
        if not trip:
            try:
                db = get_database()
                if db is not None:
                    trip = await db["trips"].find_one({"id": trip_id})
                    if trip:
                        IN_MEMORY_TRIPS[trip_id] = trip
            except Exception:
                pass
        return trip

    async def list_user_trips(self, user_id: str) -> List[Dict[str, Any]]:
        """List all trips created by a user."""
        trips = [t for t in IN_MEMORY_TRIPS.values() if t.get("user_id") == user_id]
        return trips

    async def delete_trip(self, trip_id: str) -> bool:
        """Delete trip from memory and database."""
        if trip_id in IN_MEMORY_TRIPS:
            del IN_MEMORY_TRIPS[trip_id]
            try:
                db = get_database()
                if db is not None:
                    await db["trips"].delete_one({"id": trip_id})
            except Exception:
                pass
            return True
        return False

    async def simulate_budget(self, trip_id: str, new_budget: float) -> Dict[str, Any]:
        """
        Budget What-If Simulator:
        Adjusts the user's budget and reruns the constraint-guided pipeline,
        returning a side-by-side comparison of old vs new allocation.
        """
        trip = await self.get_trip(trip_id)
        if not trip or not trip.get("itinerary"):
            raise ValueError("Trip or original itinerary not found.")

        original_itinerary = trip["itinerary"]
        original_budget = trip["params"].get("budget", 20000.0)

        # Clone trip params with new budget
        new_params = dict(trip["params"])
        new_params["budget"] = new_budget
        if new_budget < 12000:
            new_params["budget_category"] = "budget"
        elif new_budget < 35000:
            new_params["budget_category"] = "mid"
        else:
            new_params["budget_category"] = "luxury"

        # Re-run pipeline for new budget
        new_itinerary = self.coordinator.run_pipeline(new_params)
        new_itinerary["trip_id"] = trip_id

        return {
            "trip_id": trip_id,
            "original_budget": original_budget,
            "new_budget": new_budget,
            "original_expenditure": original_itinerary["total_estimated_expenditure"],
            "new_expenditure": new_itinerary["total_estimated_expenditure"],
            "original_cost_breakdown": original_itinerary["cost_breakdown"],
            "new_cost_breakdown": new_itinerary["cost_breakdown"],
            "original_itinerary": original_itinerary,
            "modified_itinerary": new_itinerary,
            "budget_diff": round(new_budget - original_budget, 2)
        }

    async def recover_activity(self, trip_id: str, activity_id: str, reason: str) -> Dict[str, Any]:
        """Dynamic Itinerary Recovery when an activity becomes unavailable."""
        trip = await self.get_trip(trip_id)
        if not trip or not trip.get("itinerary"):
            raise ValueError("Trip itinerary not found.")

        dest_id = trip["params"].get("destination", "jaipur")
        city_attractions = [a for a in ATTRACTIONS if a["destination_id"] == dest_id]

        recovery_agent = self.coordinator.optimization_agent
        recovery_result = recovery_agent.recover(
            current_itinerary=trip["itinerary"],
            unavailable_attraction_id=activity_id,
            reason=reason,
            all_attractions=city_attractions,
            trip_params=trip["params"]
        )

        if recovery_result.get("success"):
            trip["itinerary"] = recovery_result["updated_itinerary"]
            try:
                db = get_database()
                if db is not None:
                    await db["trips"].update_one(
                        {"id": trip_id},
                        {"$set": {"itinerary": recovery_result["updated_itinerary"]}}
                    )
            except Exception:
                pass

        return recovery_result

