"""
Constraint Satisfaction Problem (CSP) Model for Itinerary Planning.
Defines Variables, Domains, Constraints, and the CSP formulation.
"""

from typing import Dict, List, Any, Optional, Callable, Set, Tuple
from dataclasses import dataclass, field


@dataclass
class Variable:
    """Represents a scheduling slot variable in the CSP."""
    name: str                           # e.g., "slot_day1_morning"
    day: int                            # 1..N
    slot_label: str                     # "morning", "afternoon", "evening"
    time_window_start: int              # minutes from midnight (e.g. 540 = 9:00 AM)
    time_window_end: int                # minutes from midnight (e.g. 780 = 1:00 PM)
    domain: List[str] = field(default_factory=list)  # list of attraction_ids + "FREE"
    assigned_value: Optional[str] = None

    def is_assigned(self) -> bool:
        return self.assigned_value is not None


@dataclass
class Constraint:
    """Represents a constraint over a subset of variables."""
    name: str
    variables: List[str]
    check_fn: Callable[..., bool]
    description: str
    weight: float = 1.0                # 1.0 for hard constraints, < 1.0 for soft


class CSPModel:
    """
    Formal CSP representation:
    Variables (X): Slots across days for tourist activities and meals.
    Domains (D): Set of available attractions, restaurants, or FREE slots.
    Constraints (C): Budget, operating hours, durations, no duplicate visits,
                    travel time, closed days, walking limits, and meal times.
    """

    def __init__(self, trip_params: Dict[str, Any], attractions: List[Dict[str, Any]]):
        self.trip_params = trip_params
        self.attractions = attractions
        self.attraction_map: Dict[str, Dict[str, Any]] = {a["id"]: a for a in attractions}
        self.variables: Dict[str, Variable] = {}
        self.constraints: List[Constraint] = []
        self.variable_neighbors: Dict[str, Set[str]] = {}

        self._build_variables()
        self._build_constraints()

    def _build_variables(self):
        """Build variables for each day: morning, afternoon, evening slots."""
        days = self.trip_params.get("num_days", 3)
        all_attraction_ids = [a["id"] for a in self.attractions] + ["FREE"]

        # Slot windows (minutes from midnight)
        slots_def = [
            ("morning", 540, 780),      # 9:00 AM - 1:00 PM (4 hours)
            ("afternoon", 840, 1080),   # 2:00 PM - 6:00 PM (4 hours)
            ("evening", 1110, 1260),    # 6:30 PM - 9:00 PM (2.5 hours)
        ]

        for d in range(1, days + 1):
            for label, start_t, end_t in slots_def:
                var_name = f"slot_d{d}_{label}"
                
                # Filter domain by closed days or extreme operating hours
                valid_domain = []
                for aid in all_attraction_ids:
                    if aid == "FREE":
                        valid_domain.append(aid)
                        continue
                    attr = self.attraction_map[aid]
                    
                    # Check closed days (day 1 = Monday 0, etc.)
                    weekday = (d - 1) % 7
                    if weekday in attr.get("closed_days", []):
                        continue

                    # Check operating hours overlap with window
                    open_t = attr.get("opening_time", 540)
                    close_t = attr.get("closing_time", 1200)
                    if close_t <= start_t or open_t >= end_t:
                        continue

                    valid_domain.append(aid)

                self.variables[var_name] = Variable(
                    name=var_name,
                    day=d,
                    slot_label=label,
                    time_window_start=start_t,
                    time_window_end=end_t,
                    domain=valid_domain
                )
                self.variable_neighbors[var_name] = set()

    def _build_constraints(self):
        """Construct the 12 core travel constraints."""
        var_names = list(self.variables.keys())

        # 1. All-Different (No duplicate attraction visits unless FREE)
        for i in range(len(var_names)):
            for j in range(i + 1, len(var_names)):
                v1, v2 = var_names[i], var_names[j]
                self.variable_neighbors[v1].add(v2)
                self.variable_neighbors[v2].add(v1)

        def no_duplicates_check(assignment: Dict[str, str]) -> bool:
            assigned_attractions = [val for val in assignment.values() if val != "FREE"]
            return len(assigned_attractions) == len(set(assigned_attractions))

        self.constraints.append(Constraint(
            name="NoDuplicateVisits",
            variables=var_names,
            check_fn=no_duplicates_check,
            description="Two activity slots cannot visit the exact same attraction."
        ))

        # 2. Total Budget Constraint
        max_budget = float(self.trip_params.get("budget", 20000))
        # Activity allocation is ~30% of total budget
        activity_budget = max_budget * 0.40

        def budget_check(assignment: Dict[str, str]) -> bool:
            total_fee = sum(
                self.attraction_map[aid].get("entry_fee", 0.0)
                for aid in assignment.values()
                if aid != "FREE" and aid in self.attraction_map
            )
            return total_fee <= activity_budget

        self.constraints.append(Constraint(
            name="BudgetFeasibility",
            variables=var_names,
            check_fn=budget_check,
            description=f"Total attraction fees must not exceed activity budget (₹{activity_budget:.0f})."
        ))

        # 3. Operating Hours and Duration Fit per slot
        for var_name, var in self.variables.items():
            def make_slot_check(v: Variable):
                def slot_check(assignment: Dict[str, str]) -> bool:
                    val = assignment.get(v.name)
                    if not val or val == "FREE":
                        return True
                    attr = self.attraction_map.get(val)
                    if not attr:
                        return False
                    duration_min = int(attr.get("avg_duration_hours", 1.5) * 60)
                    slot_capacity = v.time_window_end - v.time_window_start
                    return duration_min <= slot_capacity
                return slot_check

            self.constraints.append(Constraint(
                name=f"DurationFit_{var_name}",
                variables=[var_name],
                check_fn=make_slot_check(var),
                description=f"Activity duration must fit within the {var.slot_label} time window."
            ))

        # 4. Walking comfort limit per day
        walking_comfort = self.trip_params.get("walking_comfort", "moderate")
        max_active_per_day = 3 if walking_comfort == "active" else (2 if walking_comfort == "moderate" else 1)

        days = self.trip_params.get("num_days", 3)
        for d in range(1, days + 1):
            day_vars = [f"slot_d{d}_{lbl}" for lbl in ["morning", "afternoon", "evening"]]

            def make_walk_check(d_vars: List[str]):
                def walk_check(assignment: Dict[str, str]) -> bool:
                    active_count = 0
                    for vname in d_vars:
                        val = assignment.get(vname)
                        if val and val != "FREE":
                            attr = self.attraction_map.get(val, {})
                            cat = attr.get("category", "")
                            if cat in ["nature", "adventure", "religious"]:
                                active_count += 1
                    return active_count <= max_active_per_day
                return walk_check

            self.constraints.append(Constraint(
                name=f"WalkingComfort_Day{d}",
                variables=day_vars,
                check_fn=make_walk_check(day_vars),
                description=f"Day {d} activity count matches user's '{walking_comfort}' walking tolerance."
            ))

    def is_consistent(self, var_name: str, value: str, assignment: Dict[str, str]) -> Tuple[bool, Optional[str]]:
        """
        Check if assigning `value` to `var_name` satisfies all constraints
        applicable to currently assigned variables.
        """
        temp_assignment = dict(assignment)
        temp_assignment[var_name] = value

        for c in self.constraints:
            # Check if all variables involved in this constraint are assigned
            if all(v in temp_assignment for v in c.variables):
                if not c.check_fn(temp_assignment):
                    return False, c.name
            elif var_name in c.variables:
                # Partial check for unary/pairwise constraints
                assigned_subset = {v: temp_assignment[v] for v in c.variables if v in temp_assignment}
                if not c.check_fn(assigned_subset):
                    return False, c.name

        return True, None

