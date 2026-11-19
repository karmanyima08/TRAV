"""
AI Engine API Endpoints: Direct interactive execution of State Space Search algorithms,
CSP Backtracking solver, Multi-Agent telemetry, and Explainable AI reasoning.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from app.schemas.search import SearchRunRequest, CSPRunRequest
from app.ai_engine.search.state import TravelProblem
from app.ai_engine.search.algorithms import run_algorithm
from app.ai_engine.csp.model import CSPModel
from app.ai_engine.csp.solver import BacktrackingCSPSolver
from app.ai_engine.knowledge_base.facts import ATTRACTIONS, DESTINATIONS
from app.agents.coordinator import AgentCoordinator

router = APIRouter()
coordinator = AgentCoordinator()


@router.post("/search")
async def execute_search_algorithm(req: SearchRunRequest):
    """
    Execute any State Space Search algorithm: BFS, DFS, UCS, Greedy Best-First, or A*.
    Returns full node tree, g(n), h(n), f(n) evaluation, frontier progression,
    and solution path for visualization and academic comparison.
    """
    dest_id = req.destination.lower()
    city_attractions = [a for a in ATTRACTIONS if a["destination_id"] == dest_id]
    if not city_attractions:
        city_attractions = [a for a in ATTRACTIONS if a["destination_id"] == "jaipur"]

    problem = TravelProblem(
        destination=req.destination,
        attractions=city_attractions,
        days=req.num_days,
        budget=req.budget,
        preferences={
            "interests": req.interests,
            "walking_comfort": req.walking_comfort,
            "transport_preference": req.transport_preference
        }
    )

    result = run_algorithm(req.algorithm, problem)
    return result


@router.post("/csp")
async def execute_csp_solver(req: CSPRunRequest):
    """
    Execute the CSP solver with Backtracking, MRV heuristic, Degree heuristic,
    Least Constraining Value (LCV), and Forward Checking.
    Returns step-by-step assignments, prunings, backtracks, and final schedule.
    """
    dest_id = req.destination.lower()
    city_attractions = [a for a in ATTRACTIONS if a["destination_id"] == dest_id]
    if not city_attractions:
        city_attractions = [a for a in ATTRACTIONS if a["destination_id"] == "jaipur"]

    trip_params = {
        "num_days": req.num_days,
        "budget": req.budget,
        "interests": req.interests,
        "walking_comfort": req.walking_comfort
    }

    csp_model = CSPModel(trip_params=trip_params, attractions=city_attractions)
    solver = BacktrackingCSPSolver(csp_model=csp_model, max_steps=req.max_steps)
    result = solver.solve()
    return result


@router.get("/agents/status")
async def get_agent_status():
    """Retrieve real-time status and logs of all 5 autonomous AI agents."""
    return coordinator.get_agents_status()


@router.get("/peas")
async def get_peas_framework():
    """Retrieve academic PEAS (Performance, Environment, Actuators, Sensors) framework."""
    return coordinator.get_all_peas()


@router.post("/group-optimize")
async def optimize_group_preferences(payload: Dict[str, Any]):
    """
    Group Travel Optimizer:
    Aggregates conflicting preferences across group members using weighted balancing,
    satisfaction indices, and generates a unified consensus itinerary.
    """
    group_members = payload.get("group_members", [])
    if not group_members:
        raise HTTPException(status_code=400, detail="At least 2 group members required.")

    # Calculate individual satisfaction
    member_scores = {}
    all_interests = set()
    for m in group_members:
        all_interests.update(m.get("interests", []))

    for m in group_members:
        member_name = m.get("name", "Traveler")
        m_interests = set(m.get("interests", []))
        # Satisfaction is overlap ratio with group itinerary interests
        satisfaction_ratio = len(m_interests & all_interests) / max(1, len(m_interests))
        member_scores[member_name] = {
            "satisfaction_percentage": round(satisfaction_ratio * 100, 1),
            "interests": list(m_interests),
            "budget": m.get("budget", "Flexible")
        }

    # Run pipeline with aggregated group profile
    trip_params = {
        "destination": payload.get("destination", "jaipur"),
        "num_days": payload.get("num_days", 3),
        "budget": payload.get("budget", 30000),
        "interests": list(all_interests),
        "group_members": group_members,
        "travel_type": "group"
    }

    pipeline_result = coordinator.run_pipeline(trip_params)
    return {
        "group_satisfaction_summary": member_scores,
        "overall_group_harmony_index": round(
            sum(v["satisfaction_percentage"] for v in member_scores.values()) / max(1, len(member_scores)), 1
        ),
        "itinerary": pipeline_result
    }

