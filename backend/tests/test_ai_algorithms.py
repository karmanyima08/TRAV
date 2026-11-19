"""
Unit Tests for AI Algorithms:
- State Space Search (BFS, DFS, UCS, Greedy, A*)
- CSP Backtracking Solver (MRV, Degree, LCV, Forward Checking)
- Knowledge Representation & Forward Chaining Inference
- Multi-Agent Pipeline Execution
- Dynamic Itinerary Recovery
"""

import pytest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ai_engine.search.state import TravelProblem
from app.ai_engine.search.algorithms import astar, bfs, dfs, ucs, greedy_best_first
from app.ai_engine.csp.model import CSPModel
from app.ai_engine.csp.solver import BacktrackingCSPSolver
from app.ai_engine.knowledge_base.facts import ATTRACTIONS, DESTINATIONS
from app.ai_engine.knowledge_base.inference_engine import InferenceEngine
from app.agents.coordinator import AgentCoordinator


@pytest.fixture
def sample_jaipur_data():
    attractions = [a for a in ATTRACTIONS if a["destination_id"] == "jaipur"]
    return attractions


def test_state_space_search_astar(sample_jaipur_data):
    """Test A* Search algorithm produces optimal path with admissible heuristic."""
    problem = TravelProblem(
        destination="Jaipur",
        attractions=sample_jaipur_data,
        days=2,
        budget=15000,
        preferences={"interests": ["historical", "cultural"], "walking_comfort": "moderate"}
    )
    res = astar(problem, max_nodes=500)
    assert res["algorithm"] == "A*"
    assert res["total_explored"] > 0
    assert len(res["solution_path"]) > 0
    assert res["path_cost"] >= 0
    assert "scheduled_activities" in res


def test_search_algorithms_comparison(sample_jaipur_data):
    """Test that all 5 required search algorithms execute successfully."""
    problem = TravelProblem(
        destination="Jaipur",
        attractions=sample_jaipur_data[:6],
        days=2,
        budget=15000,
        preferences={"interests": ["historical"]}
    )

    res_astar = astar(problem, max_nodes=200)
    res_bfs = bfs(problem, max_nodes=200)
    res_dfs = dfs(problem, max_nodes=200)
    res_ucs = ucs(problem, max_nodes=200)
    res_greedy = greedy_best_first(problem, max_nodes=200)

    assert res_astar["algorithm"] == "A*"
    assert res_bfs["algorithm"] == "BFS"
    assert res_dfs["algorithm"] == "DFS"
    assert res_ucs["algorithm"] == "UCS"
    assert res_greedy["algorithm"] == "Greedy Best-First"


def test_csp_solver_with_heuristics(sample_jaipur_data):
    """Test CSP solver with MRV, Degree, LCV, and Forward Checking."""
    trip_params = {
        "num_days": 2,
        "budget": 20000,
        "interests": ["historical"],
        "walking_comfort": "moderate"
    }
    csp_model = CSPModel(trip_params=trip_params, attractions=sample_jaipur_data)
    solver = BacktrackingCSPSolver(csp_model=csp_model, max_steps=500)
    res = solver.solve()

    assert res["solved"] is True
    assert len(res["scheduled_slots"]) > 0
    assert res["total_steps"] > 0
    assert "assignment" in res


def test_knowledge_base_inference(sample_jaipur_data):
    """Test Forward Chaining inference and explanation generation."""
    engine = InferenceEngine()
    amber_fort = next(a for a in sample_jaipur_data if a["id"] == "jpr_amber_fort")

    res = engine.forward_chain(
        attraction=amber_fort,
        user_prefs={"interests": ["historical"], "budget_category": "mid"},
        context={"weather": "sunny"}
    )

    assert res["score"] > 0.5
    assert len(res["fired_rules"]) > 0
    assert len(res["explanations"]) > 0
    assert any("historical" in exp.lower() for exp in res["explanations"])


def test_multi_agent_pipeline():
    """Test end-to-end multi-agent coordinator execution."""
    coordinator = AgentCoordinator()
    trip_params = {
        "destination": "jaipur",
        "num_days": 2,
        "num_travelers": 2,
        "budget": 15000.0,
        "interests": ["historical", "food"],
        "walking_comfort": "moderate",
        "search_algorithm": "astar"
    }

    output = coordinator.run_pipeline(trip_params)

    assert output["destination"]["name"] == "Jaipur"
    assert len(output["days"]) == 2
    assert output["total_estimated_expenditure"] > 0
    assert len(output["agent_logs"]) > 0
    assert "DestinationResearchAgent" in output["peas_framework"]
    assert "ItineraryPlanningAgent" in output["peas_framework"]
    assert "ConstraintValidationAgent" in output["peas_framework"]


def test_dynamic_recovery():
    """Test dynamic recovery replacing an unavailable attraction."""
    coordinator = AgentCoordinator()
    trip_params = {
        "destination": "jaipur",
        "num_days": 2,
        "budget": 20000.0,
        "interests": ["historical"],
        "walking_comfort": "moderate"
    }
    output = coordinator.run_pipeline(trip_params)

    # Pick an assigned activity
    day1_activities = output["days"][0]["activities"]
    if day1_activities:
        target_aid = day1_activities[0]["attraction_id"]
        recovery_res = coordinator.optimization_agent.recover(
            current_itinerary=output,
            unavailable_attraction_id=target_aid,
            reason="Closed for annual conservation maintenance",
            all_attractions=[a for a in ATTRACTIONS if a["destination_id"] == "jaipur"],
            trip_params=trip_params
        )

        assert recovery_res["success"] is True
        assert recovery_res["replacement_activity"]["attraction_id"] != target_aid
        assert "recovery_explanation" in recovery_res


if __name__ == "__main__":
    pytest.main(["-v", __file__])

