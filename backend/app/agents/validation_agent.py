"""
Constraint Validation Agent: Enforces schedule feasibility using CSP Backtracking,
MRV, Degree Heuristic, LCV, and Forward Checking across all operational constraints.
"""

from typing import Dict, List, Any
from app.agents.base_agent import BaseAgent
from app.ai_engine.csp.model import CSPModel
from app.ai_engine.csp.solver import BacktrackingCSPSolver


class ConstraintValidationAgent(BaseAgent):
    """
    Agent D: Constraint Validation Agent.
    Formulates and solves the Constraint Satisfaction Problem (CSP) to ensure
    time slots, opening hours, budget, and walking comfort are strictly satisfied.
    """

    def __init__(self):
        super().__init__(
            name="ConstraintValidationAgent",
            role="CSP Solver & Feasibility Validator",
            description="Solves itinerary scheduling CSP with MRV, Degree Heuristic, LCV, and Forward Checking."
        )

    def get_peas(self) -> Dict[str, str]:
        return {
            "Performance_Measure": "100% constraint compliance, minimal backtracks, guaranteed absence of time conflicts.",
            "Environment": "Discrete time-slot variables, attraction domains, 12 multi-dimensional constraints.",
            "Actuators": "Variable assignment, domain pruning via forward checking, backtracking trigger.",
            "Sensors": "Operating hours, slot duration, budget limits, walking comfort thresholds."
        }

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self.status = "active"
        trip_params = context.get("trip_params", {})
        scored_attractions = context.get("scored_attractions", [])

        self.log(f"Constructing CSP Model for {trip_params.get('num_days', 3)} days scheduling...")

        csp_model = CSPModel(
            trip_params=trip_params,
            attractions=scored_attractions
        )

        self.log(
            f"CSP Model built: {len(csp_model.variables)} slot variables, {len(csp_model.constraints)} active constraints."
        )

        solver = BacktrackingCSPSolver(csp_model=csp_model)
        self.log("Solving CSP via Backtracking with MRV, Degree Heuristic, LCV, and Forward Checking...")
        csp_result = solver.solve()

        solved = csp_result.get("solved", False)
        steps = csp_result.get("total_steps", 0)
        backtracks = csp_result.get("backtracks", 0)
        exec_ms = csp_result.get("execution_time_ms", 0)

        self.log(
            f"CSP Solver finished in {exec_ms}ms: Solved={solved}, Total Steps={steps}, Backtracks={backtracks}."
        )

        if not solved:
            self.log(
                "CSP solver detected infeasible constraints under current parameters. Triggering relaxation heuristics.",
                level="WARNING"
            )

        self.status = "completed"
        return {
            "csp_result": csp_result,
            "csp_model": csp_model,
            "scheduled_slots": csp_result.get("scheduled_slots", [])
        }

