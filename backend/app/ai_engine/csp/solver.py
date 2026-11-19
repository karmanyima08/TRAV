"""
CSP Solver implementing Backtracking Search with:
- Minimum Remaining Values (MRV) Heuristic
- Degree Heuristic (tie-breaker for MRV)
- Least Constraining Value (LCV) Heuristic
- Forward Checking
- Comprehensive step-by-step telemetry for visualizer and grading evaluation
"""

import time
from typing import Dict, List, Any, Optional, Set, Tuple
from app.ai_engine.csp.model import CSPModel, Variable, Constraint


class BacktrackingCSPSolver:
    """
    Intelligent CSP Backtracking Solver for Travel Itinerary Scheduling.
    Implements MRV, Degree Heuristic, LCV, and Forward Checking.
    """

    def __init__(self, csp_model: CSPModel, max_steps: int = 1500):
        self.model = csp_model
        self.max_steps = max_steps
        self.steps_log: List[Dict[str, Any]] = []
        self.backtracks_count = 0
        self.steps_count = 0
        self.domain_history: List[Dict[str, List[str]]] = []

    def _select_unassigned_variable_mrv_degree(
        self,
        assignment: Dict[str, str],
        domains: Dict[str, List[str]]
    ) -> Optional[str]:
        """
        Minimum Remaining Values (MRV) heuristic with Degree Heuristic tie-breaker.
        Selects the unassigned variable with the fewest legal values.
        Ties are broken by selecting the variable involved in the largest number
        of constraints on remaining unassigned variables.
        """
        unassigned = [v for v in self.model.variables if v not in assignment]
        if not unassigned:
            return None

        # MRV: sort by domain size
        min_domain_size = min(len(domains[v]) for v in unassigned)
        mrv_candidates = [v for v in unassigned if len(domains[v]) == min_domain_size]

        if len(mrv_candidates) == 1:
            return mrv_candidates[0]

        # Degree Heuristic tie-breaker: count active constraints with unassigned neighbors
        def degree_count(var_name: str) -> int:
            neighbors = self.model.variable_neighbors.get(var_name, set())
            return sum(1 for n in neighbors if n not in assignment)

        mrv_candidates.sort(key=degree_count, reverse=True)
        return mrv_candidates[0]

    def _order_domain_values_lcv(
        self,
        var_name: str,
        assignment: Dict[str, str],
        domains: Dict[str, List[str]]
    ) -> List[str]:
        """
        Least Constraining Value (LCV) heuristic:
        Prefers the value that rules out the fewest choices for neighboring unassigned variables.
        """
        values = domains[var_name]
        if len(values) <= 1:
            return values

        neighbors = [n for n in self.model.variable_neighbors.get(var_name, set()) if n not in assignment]

        def count_conflicts(val: str) -> int:
            if val == "FREE":
                # FREE slots never constrain neighbors
                return 0
            conflicts = 0
            for n in neighbors:
                if val in domains[n]:
                    conflicts += 1
            return conflicts

        # Sort ascending by conflicts ruled out
        return sorted(values, key=count_conflicts)

    def _forward_check(
        self,
        var_name: str,
        value: str,
        assignment: Dict[str, str],
        domains: Dict[str, List[str]]
    ) -> Tuple[bool, Dict[str, List[str]], Dict[str, List[str]]]:
        """
        Forward Checking:
        Prune domain values of unassigned neighbors that would violate constraints.
        Returns: (is_valid, new_domains, pruned_records)
        """
        new_domains = {v: list(vals) for v, vals in domains.items()}
        pruned_records: Dict[str, List[str]] = {}

        if value == "FREE":
            return True, new_domains, pruned_records

        neighbors = [n for n in self.model.variable_neighbors.get(var_name, set()) if n not in assignment]

        for n in neighbors:
            pruned_records[n] = []
            valid_vals = []
            for n_val in new_domains[n]:
                consistent, _ = self.model.is_consistent(n, n_val, {**assignment, var_name: value})
                if consistent:
                    valid_vals.append(n_val)
                else:
                    pruned_records[n].append(n_val)
            
            new_domains[n] = valid_vals
            # If any neighbor's domain becomes empty, forward checking detects domain wipeout
            if not valid_vals:
                return False, new_domains, pruned_records

        return True, new_domains, pruned_records

    def solve(self) -> Dict[str, Any]:
        """Execute the backtracking search with MRV, Degree, LCV, and Forward Checking."""
        start_time = time.perf_counter()
        initial_domains = {vname: list(var.domain) for vname, var in self.model.variables.items()}

        assignment: Dict[str, str] = {}
        success = self._backtrack(assignment, initial_domains)
        exec_time_ms = (time.perf_counter() - start_time) * 1000.0

        # Construct final scheduled slots
        scheduled_slots = []
        for var_name, assigned_val in assignment.items():
            var = self.model.variables[var_name]
            attr_details = self.model.attraction_map.get(assigned_val, None) if assigned_val != "FREE" else None
            scheduled_slots.append({
                "variable": var_name,
                "day": var.day,
                "slot_label": var.slot_label,
                "time_window": f"{var.time_window_start // 60}:{var.time_window_start % 60:02d} - {var.time_window_end // 60}:{var.time_window_end % 60:02d}",
                "assigned_id": assigned_val,
                "attraction_name": attr_details.get("name", "Rest / Leisure") if attr_details else "Rest / Leisure",
                "category": attr_details.get("category", "rest") if attr_details else "rest",
                "entry_fee": attr_details.get("entry_fee", 0.0) if attr_details else 0.0,
                "duration_hours": attr_details.get("avg_duration_hours", 0) if attr_details else 0
            })

        return {
            "solved": success,
            "assignment": assignment,
            "scheduled_slots": scheduled_slots,
            "total_steps": self.steps_count,
            "backtracks": self.backtracks_count,
            "execution_time_ms": round(exec_time_ms, 2),
            "steps": self.steps_log[:100],  # Telemetry steps for UI visualizer
            "variables_count": len(self.model.variables),
            "constraints_count": len(self.model.constraints)
        }

    def _backtrack(
        self,
        assignment: Dict[str, str],
        domains: Dict[str, List[str]]
    ) -> bool:
        """Recursive backtracking procedure with heuristics and forward checking."""
        if len(assignment) == len(self.model.variables):
            return True

        if self.steps_count >= self.max_steps:
            return False

        # Select variable using MRV + Degree heuristic
        var_name = self._select_unassigned_variable_mrv_degree(assignment, domains)
        if var_name is None:
            return True

        # Order values using LCV
        ordered_values = self._order_domain_values_lcv(var_name, assignment, domains)

        for val in ordered_values:
            self.steps_count += 1
            var = self.model.variables[var_name]

            # Check consistency with active constraints
            is_consistent, violation_name = self.model.is_consistent(var_name, val, assignment)

            if not is_consistent:
                if len(self.steps_log) < 100:
                    self.steps_log.append({
                        "step": self.steps_count,
                        "variable": var_name,
                        "day": var.day,
                        "slot": var.slot_label,
                        "value": val,
                        "action": "PRUNED_BY_CONSTRAINT",
                        "constraint": violation_name,
                        "result": "INCONSISTENT"
                    })
                continue

            # Forward check
            fc_valid, new_domains, pruned = self._forward_check(var_name, val, assignment, domains)

            if len(self.steps_log) < 100:
                self.steps_log.append({
                    "step": self.steps_count,
                    "variable": var_name,
                    "day": var.day,
                    "slot": var.slot_label,
                    "value": val,
                    "action": "ASSIGN_AND_FORWARD_CHECK",
                    "domain_size": len(domains[var_name]),
                    "pruned_count": sum(len(p) for p in pruned.values()),
                    "result": "VALID" if fc_valid else "DOMAIN_EMPTY"
                })

            if fc_valid:
                assignment[var_name] = val
                result = self._backtrack(assignment, new_domains)
                if result:
                    return True
                # Undo assignment
                del assignment[var_name]

            # Backtracking occurred
            self.backtracks_count += 1
            if len(self.steps_log) < 100:
                self.steps_log.append({
                    "step": self.steps_count,
                    "variable": var_name,
                    "day": var.day,
                    "slot": var.slot_label,
                    "value": val,
                    "action": "BACKTRACK",
                    "reason": "Branch exhausted or neighbor domain empty",
                    "result": "BACKTRACKED"
                })

        return False

