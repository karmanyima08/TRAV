"""
Centralized Agent Coordinator: Manages communication, inter-agent data piping,
and synchronized lifecycle execution for all specialized travel planning agents.
"""

from typing import Dict, List, Any
import time
from app.agents.destination_agent import DestinationResearchAgent
from app.agents.preference_agent import UserPreferenceAgent
from app.agents.planning_agent import ItineraryPlanningAgent
from app.agents.validation_agent import ConstraintValidationAgent
from app.agents.optimization_agent import OptimizationRecoveryAgent


class AgentCoordinator:
    """
    Centralized Controller for the Multi-Agent System.
    Orchestrates the sequential and cooperative agent interaction pipeline:
    DestinationResearchAgent -> UserPreferenceAgent -> ItineraryPlanningAgent ->
    ConstraintValidationAgent -> OptimizationRecoveryAgent -> Enriched Output.
    """

    def __init__(self):
        self.destination_agent = DestinationResearchAgent()
        self.preference_agent = UserPreferenceAgent()
        self.planning_agent = ItineraryPlanningAgent()
        self.validation_agent = ConstraintValidationAgent()
        self.optimization_agent = OptimizationRecoveryAgent()

        self.agents = [
            self.destination_agent,
            self.preference_agent,
            self.planning_agent,
            self.validation_agent,
            self.optimization_agent
        ]

    def get_agents_status(self) -> List[Dict[str, Any]]:
        """Return status and recent telemetry from all active agents."""
        return [a.get_status_info() for a in self.agents]

    def get_all_peas(self) -> Dict[str, Dict[str, str]]:
        """Return PEAS framework profiles for all agents for academic report generation."""
        return {a.name: a.get_peas() for a in self.agents}

    def run_pipeline(self, trip_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute full end-to-end multi-agent cooperative itinerary synthesis.
        """
        start_time = time.perf_counter()
        pipeline_context: Dict[str, Any] = {
            "trip_params": trip_params,
            "destination_id": trip_params.get("destination", "jaipur"),
            "weather": trip_params.get("weather", "sunny")
        }

        # 1. Destination Research Agent
        res1 = self.destination_agent.execute(pipeline_context)
        pipeline_context.update(res1)

        # 2. User Preference Agent
        res2 = self.preference_agent.execute(pipeline_context)
        pipeline_context.update(res2)

        # 3. Itinerary Planning Agent (State Space Search / A*)
        res3 = self.planning_agent.execute(pipeline_context)
        pipeline_context.update(res3)

        # 4. Constraint Validation Agent (CSP Solver)
        res4 = self.validation_agent.execute(pipeline_context)
        pipeline_context.update(res4)

        # 5. Optimization & Recovery Agent (Route clustering & dining)
        res5 = self.optimization_agent.execute(pipeline_context)
        pipeline_context.update(res5)

        total_exec_time_ms = (time.perf_counter() - start_time) * 1000.0

        # Collect all agent logs in chronological order
        all_logs = []
        for a in self.agents:
            all_logs.extend(a.execution_logs)
        all_logs.sort(key=lambda x: x["timestamp"])

        # Cost calculations
        budget = float(trip_params.get("budget", 20000))
        num_days = int(trip_params.get("num_days", 3))
        attraction_cost = pipeline_context.get("total_attraction_cost", 1500.0)
        
        # Estimate food (₹1,000/day/person) and transport (₹500/day)
        num_travelers = int(trip_params.get("num_travelers", 1))
        estimated_food_cost = num_days * num_travelers * 1000.0
        estimated_transit_cost = num_days * 500.0
        # Accommodation allocation: remaining budget or ~₹2,500/night
        estimated_hotel_cost = max(2000.0 * (num_days - 1), budget * 0.40)
        
        total_estimated_expenditure = attraction_cost + estimated_food_cost + estimated_transit_cost + estimated_hotel_cost
        budget_utilization_pct = min(100.0, round((total_estimated_expenditure / max(1.0, budget)) * 100.0, 1))

        return {
            "destination": pipeline_context.get("destination"),
            "trip_params": trip_params,
            "days": pipeline_context.get("days", []),
            "total_estimated_expenditure": round(total_estimated_expenditure, 2),
            "cost_breakdown": {
                "attractions": round(attraction_cost, 2),
                "food": round(estimated_food_cost, 2),
                "transport": round(estimated_transit_cost, 2),
                "accommodation": round(estimated_hotel_cost, 2)
            },
            "budget_utilization_percentage": budget_utilization_pct,
            "search_metadata": pipeline_context.get("search_result", {}),
            "csp_metadata": pipeline_context.get("csp_result", {}),
            "agent_logs": all_logs,
            "peas_framework": self.get_all_peas(),
            "pipeline_time_ms": round(total_exec_time_ms, 2)
        }

