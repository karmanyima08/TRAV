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


def test_all_step_costs_non_negative(sample_jaipur_data):
    """Verify that all transition step costs c(step) are strictly non-negative."""
    problem = TravelProblem(
        destination="Jaipur",
        attractions=sample_jaipur_data[:6],
        days=2,
        budget=15000,
        preferences={"interests": ["historical", "cultural"]}
    )
    queue = [problem.get_initial_state()]
    visited_states = set()
    transitions_checked = 0

    while queue and len(visited_states) < 30:
        state = queue.pop(0)
        s_hash = (state.current_day, state.current_time, state.current_location, tuple(state.visited_attractions))
        if s_hash in visited_states:
            continue
        visited_states.add(s_hash)

        for action in problem.get_actions(state):
            next_state = problem.apply_action(state, action)
            step_cost = problem.step_cost(state, action, next_state)
            path_step = problem.path_cost(0.0, state, action, next_state)
            assert step_cost >= 0.0, f"Negative step cost encountered: {step_cost}"
            assert path_step >= 0.0, f"Negative path step cost encountered: {path_step}"
            assert abs(step_cost - path_step) < 1e-9
            transitions_checked += 1
            queue.append(next_state)

    assert transitions_checked > 0


def test_heuristic_admissible_brute_force(sample_jaipur_data):
    """
    Verify h(n) <= h*(n) (admissibility) by brute-force exhaustive search on a small instance.
    """
    small_attractions = sample_jaipur_data[:4]
    problem = TravelProblem(
        destination="Jaipur",
        attractions=small_attractions,
        days=1,
        budget=10000,
        preferences={"interests": ["historical"]}
    )

    def brute_force_h_star(state, depth=0):
        if problem.is_goal(state):
            return 0.0
        if depth >= 5:
            return float("inf")
        best = float("inf")
        for act in problem.get_actions(state):
            next_state = problem.apply_action(state, act)
            c = problem.step_cost(state, act, next_state)
            rem = brute_force_h_star(next_state, depth + 1)
            if rem < float("inf"):
                best = min(best, c + rem)
        return best

    init_state = problem.get_initial_state()
    h_init = problem.heuristic(init_state)
    h_star_init = brute_force_h_star(init_state)

    assert h_star_init < float("inf"), "Brute force must find a valid goal"
    assert h_init <= h_star_init + 1e-9, f"Heuristic overestimates: h={h_init} > h*={h_star_init}"

    for act in problem.get_actions(init_state):
        next_s = problem.apply_action(init_state, act)
        h_s = problem.heuristic(next_s)
        h_star_s = brute_force_h_star(next_s)
        if h_star_s < float("inf"):
            assert h_s <= h_star_s + 1e-9, f"Heuristic overestimates on intermediate state: h={h_s} > h*={h_star_s}"


def test_heuristic_consistency_transitions(sample_jaipur_data):
    """
    Verify monotonicity / consistency (triangle inequality):
    h(n) <= c(n, n') + h(n') for all transitions.
    """
    import random
    problem = TravelProblem(
        destination="Jaipur",
        attractions=sample_jaipur_data,
        days=2,
        budget=20000,
        preferences={"interests": ["historical", "food"]}
    )

    states = [problem.get_initial_state()]
    for _ in range(50):
        if not states:
            break
        current = random.choice(states)
        actions = problem.get_actions(current)
        if not actions:
            states.remove(current)
            continue

        h_current = problem.heuristic(current)
        for act in actions:
            next_state = problem.apply_action(current, act)
            step_c = problem.step_cost(current, act, next_state)
            h_next = problem.heuristic(next_state)

            assert h_current <= step_c + h_next + 1e-6, (
                f"Consistency violated: h(n)={h_current} > c={step_c} + h(n')={h_next}"
            )
            if len(states) < 15:
                states.append(next_state)


def test_astar_ucs_cost_equivalence_small_instances(sample_jaipur_data):
    """
    A* and UCS must find solutions with identical optimal path costs on small instances.
    """
    problem = TravelProblem(
        destination="Jaipur",
        attractions=sample_jaipur_data[:5],
        days=1,
        budget=10000,
        preferences={"interests": ["historical"]}
    )

    res_astar = astar(problem, max_nodes=500)
    res_ucs = ucs(problem, max_nodes=500)

    assert res_astar["solution_found"] is True
    assert res_ucs["solution_found"] is True
    assert abs(res_astar["path_cost"] - res_ucs["path_cost"]) < 1e-2, (
        f"A* cost ({res_astar['path_cost']}) != UCS cost ({res_ucs['path_cost']})"
    )


def test_astar_expands_fewer_or_equal_nodes_than_ucs(sample_jaipur_data):
    """
    With an admissible and consistent heuristic, A* must expand fewer or equal
    nodes than UCS to reach an optimal goal.
    """
    problem = TravelProblem(
        destination="Jaipur",
        attractions=sample_jaipur_data[:6],
        days=1,
        budget=15000,
        preferences={"interests": ["historical", "cultural"]}
    )

    res_astar = astar(problem, max_nodes=500)
    res_ucs = ucs(problem, max_nodes=500)

    assert res_astar["solution_found"] is True
    assert res_ucs["solution_found"] is True
    assert res_astar["total_explored"] <= res_ucs["total_explored"], (
        f"A* expanded more nodes ({res_astar['total_explored']}) than UCS ({res_ucs['total_explored']})"
    )


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


def test_multiday_itinerary_distinct_attractions():
    """Verify 7-day multi-day planning produces distinct attractions without repetition."""
    coordinator = AgentCoordinator()
    trip_params = {
        "destination": "jaipur",
        "num_days": 7,
        "budget": 35000.0,
        "interests": ["historical", "cultural", "architecture"],
        "walking_comfort": "moderate",
        "search_algorithm": "astar"
    }
    output = coordinator.run_pipeline(trip_params)
    days = output.get("days", [])
    assert len(days) == 7

    # Collect all scheduled attraction IDs across all 7 days
    visited_ids = []
    for day in days:
        assert len(day["activities"]) > 0  # Every day must have activities scheduled
        assert "lunch" in day["meals"] and "dinner" in day["meals"]
        for act in day["activities"]:
            aid = act["attraction_id"]
            if not aid.startswith("leisure_"):
                visited_ids.append(aid)

    # Check for zero duplicates among scheduled attractions
    assert len(visited_ids) == len(set(visited_ids)), f"Duplicate attractions detected: {visited_ids}"
    assert len(visited_ids) >= 7, "Expected at least 7 unique attractions across 7 days"


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

