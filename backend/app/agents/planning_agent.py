"""
Itinerary Planning Agent: Formulates State Space Search problem, executes A* Search
with an admissible and consistent heuristic, and generates candidate travel sequences
optimized with respect to the defined objective cost function.
"""

from typing import Dict, List, Any
from app.agents.base_agent import BaseAgent
from app.ai_engine.search.state import TravelProblem
from app.ai_engine.search.algorithms import astar, run_algorithm


class ItineraryPlanningAgent(BaseAgent):
    """
    Agent C: Itinerary Planning Agent.
    Coordinates State Space Search using A* algorithm to identify cost-optimal,
    high-reward travel sequences across the trip days.
    """

    def __init__(self):
        super().__init__(
            name="ItineraryPlanningAgent",
            role="State Space Search & Route Planner",
            description="Executes A* heuristic state space search to identify optimal attraction visit sequences."
        )

    def get_peas(self) -> Dict[str, str]:
        return {
            "Performance_Measure": "Minimized path cost f(n) = g(n) + h(n), maximized visited attraction utility, zero deadline overrun.",
            "Environment": "Discrete state space of travel states (visited sets, remaining budget, time, location).",
            "Actuators": "State transitions (ADD attraction, ADVANCE_DAY, SELECT_TRANSPORT), heuristic evaluation.",
            "Sensors": "Candidate attraction coordinates, visiting durations, travel times, budget state."
        }

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self.status = "active"
        trip_params = context.get("trip_params", {})
        scored_attractions = context.get("scored_attractions", [])
        destination = context.get("destination", {})

        num_days = int(trip_params.get("num_days", 3))
        budget = float(trip_params.get("budget", 20000))
        requested_algo = trip_params.get("search_algorithm", "astar")

        self.log(f"Formulating State Space Search problem for {num_days} days in {destination.get('name', 'City')}...")

        problem = TravelProblem(
            destination=destination.get("name", "Jaipur"),
            attractions=scored_attractions,
            days=num_days,
            budget=budget,
            preferences=trip_params,
            start_time=540  # 9:00 AM
        )

        self.log(f"Executing '{requested_algo.upper()}' search across state space...")
        search_result = run_algorithm(requested_algo, problem)

        total_explored = search_result.get("total_explored", 0)
        exec_ms = search_result.get("execution_time_ms", 0)
        sol_found = search_result.get("solution_found", False)
        cost = search_result.get("path_cost", 0)

        self.log(
            f"Search complete in {exec_ms}ms: {total_explored} states explored, solution found={sol_found}, total path cost={cost}."
        )

        self.status = "completed"
        return {
            "search_result": search_result,
            "problem": problem,
            "candidate_activities": search_result.get("scheduled_activities", [])
        }

