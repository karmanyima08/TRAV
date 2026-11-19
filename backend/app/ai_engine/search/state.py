"""
State Space Search — Travel State, Action, and Problem definitions.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
import math


@dataclass
class TravelState:
    """Represents a node in the travel planning search space."""
    destination: str
    current_day: int                          # 1-indexed
    current_time: int                         # minutes from midnight (e.g. 540 = 9 AM)
    current_location: str                     # attraction_id or "start"
    visited_attractions: List[str] = field(default_factory=list)
    remaining_budget: float = 0.0
    scheduled_activities: List[Dict] = field(default_factory=list)
    total_cost: float = 0.0
    total_time: int = 0                       # total minutes spent
    day_time_used: Dict[int, int] = field(default_factory=dict)  # day -> minutes used

    def __hash__(self):
        return hash((
            self.destination,
            self.current_day,
            self.current_time,
            self.current_location,
            tuple(sorted(self.visited_attractions)),
            round(self.remaining_budget, 2),
        ))

    def __eq__(self, other):
        if not isinstance(other, TravelState):
            return False
        return (
            self.destination == other.destination
            and self.current_day == other.current_day
            and self.current_time == other.current_time
            and self.current_location == other.current_location
            and sorted(self.visited_attractions) == sorted(other.visited_attractions)
            and round(self.remaining_budget, 2) == round(other.remaining_budget, 2)
        )

    def to_dict(self) -> Dict:
        return {
            "destination": self.destination,
            "current_day": self.current_day,
            "current_time": self.current_time,
            "current_time_str": _minutes_to_time_str(self.current_time),
            "current_location": self.current_location,
            "visited_attractions": list(self.visited_attractions),
            "remaining_budget": round(self.remaining_budget, 2),
            "scheduled_activities": list(self.scheduled_activities),
            "total_cost": round(self.total_cost, 2),
            "total_time": self.total_time,
        }

    def summary(self) -> str:
        return (
            f"Day {self.current_day}, "
            f"{_minutes_to_time_str(self.current_time)}, "
            f"Budget ₹{self.remaining_budget:.0f} remaining, "
            f"{len(self.visited_attractions)} attractions visited"
        )


@dataclass
class TravelAction:
    """An action that transitions between travel states."""
    action_type: str            # ADD | REMOVE | MOVE | SELECT_TRANSPORT | ADVANCE_DAY
    attraction_id: str = ""
    day: int = 1
    time_slot: int = 0          # minutes from midnight
    transport_mode: str = "walk"  # walk | auto | taxi | metro | bus
    cost: float = 0.0           # entry fee
    duration: int = 0           # minutes at attraction
    travel_time: int = 0        # minutes to travel to attraction

    def to_dict(self) -> Dict:
        return {
            "action_type": self.action_type,
            "attraction_id": self.attraction_id,
            "day": self.day,
            "time_slot": self.time_slot,
            "time_slot_str": _minutes_to_time_str(self.time_slot),
            "transport_mode": self.transport_mode,
            "cost": round(self.cost, 2),
            "duration": self.duration,
            "travel_time": self.travel_time,
        }


def _minutes_to_time_str(minutes: int) -> str:
    h = minutes // 60
    m = minutes % 60
    suffix = "AM" if h < 12 else "PM"
    h12 = h if h <= 12 else h - 12
    if h12 == 0:
        h12 = 12
    return f"{h12}:{m:02d} {suffix}"


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return great-circle distance in km."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _travel_minutes(dist_km: float, mode: str = "auto") -> int:
    """Estimate travel time in minutes based on distance and mode."""
    speeds = {"walk": 5, "auto": 25, "taxi": 30, "metro": 35, "bus": 20}
    speed = speeds.get(mode, 25)
    return max(5, int((dist_km / speed) * 60))


class TravelProblem:
    """
    Defines the search problem for travel itinerary planning.
    State space: all possible combinations of visited attractions, days, and timings.
    Goal: visit a satisfying set of attractions within budget and time constraints.
    """

    DAY_END_MINUTES = 21 * 60      # 9 PM
    MEAL_BREAK_MINUTES = 60        # lunch break
    MEAL_TIME = 13 * 60            # 1 PM for lunch

    def __init__(
        self,
        destination: str,
        attractions: List[Dict],
        days: int,
        budget: float,
        preferences: Dict,
        start_time: int = 540,     # 9 AM default
    ):
        self.destination = destination
        self.attractions = attractions
        self.attraction_map: Dict[str, Dict] = {a["id"]: a for a in attractions}
        self.days = days
        self.budget = budget
        self.preferences = preferences
        self.start_time = start_time
        self.transport_mode = preferences.get("transport_preference", "auto")

        # Pre-score attractions
        self.preference_scores: Dict[str, float] = {}
        self._precompute_scores()

    def _precompute_scores(self):
        interests = set(self.preferences.get("interests", []))
        budget_cat = self.preferences.get("budget_category", "mid")
        for a in self.attractions:
            score = a.get("popularity_score", 0.5)
            tags = set(a.get("tags", []) + [a.get("category", "")])
            if interests & tags:
                score += 0.3
            if a.get("budget_category") == budget_cat:
                score += 0.1
            self.preference_scores[a["id"]] = min(1.0, score)

    def get_initial_state(self) -> TravelState:
        return TravelState(
            destination=self.destination,
            current_day=1,
            current_time=self.start_time,
            current_location="start",
            visited_attractions=[],
            remaining_budget=self.budget,
            scheduled_activities=[],
            total_cost=0.0,
            total_time=0,
            day_time_used={d: 0 for d in range(1, self.days + 1)},
        )

    def _get_location_coords(self, location_id: str) -> tuple:
        """Return (lat, lng) for a location id."""
        if location_id == "start":
            # Use destination center coords if available
            if self.attractions:
                a = self.attractions[0]
                return a.get("lat", 20.0), a.get("lng", 77.0)
            return 20.0, 77.0
        a = self.attraction_map.get(location_id, {})
        return a.get("lat", 20.0), a.get("lng", 77.0)

    def get_actions(self, state: TravelState) -> List[TravelAction]:
        """Return all valid actions from the current state."""
        actions = []
        visited_set = set(state.visited_attractions)
        current_time = state.current_time
        current_day = state.current_day

        for attraction in self.attractions:
            aid = attraction["id"]
            if aid in visited_set:
                continue

            # Check entry fee feasibility
            entry_fee = attraction.get("entry_fee", 0)
            if entry_fee > state.remaining_budget:
                continue

            # Check operating hours
            open_t = attraction.get("opening_time", 360)   # default 6 AM
            close_t = attraction.get("closing_time", 1200)  # default 8 PM
            duration_min = int(attraction.get("avg_duration_hours", 1) * 60)

            # Check closed days (0=Mon … 6=Sun)
            # We skip closed day checking here (simplified)

            # Travel from current location
            clat, clng = self._get_location_coords(state.current_location)
            alat, alng = attraction.get("lat", clat), attraction.get("lng", clng)
            dist = _haversine_km(clat, clng, alat, alng)
            travel_t = _travel_minutes(dist, self.transport_mode)

            # Arrival time
            arrival = current_time + travel_t

            # Insert meal break if crossing midday
            if current_time < self.MEAL_TIME <= arrival + duration_min:
                arrival = max(arrival, self.MEAL_TIME + self.MEAL_BREAK_MINUTES)

            if arrival < open_t:
                arrival = open_t

            end_time = arrival + duration_min

            # Fits in current day?
            if end_time <= self.DAY_END_MINUTES and current_day <= self.days:
                action = TravelAction(
                    action_type="ADD",
                    attraction_id=aid,
                    day=current_day,
                    time_slot=arrival,
                    transport_mode=self.transport_mode,
                    cost=entry_fee,
                    duration=duration_min,
                    travel_time=travel_t,
                )
                actions.append(action)
            elif current_day < self.days:
                # Try on next day
                next_start = self.start_time
                if next_start < open_t:
                    next_start = open_t
                next_end = next_start + duration_min
                if next_end <= self.DAY_END_MINUTES:
                    action = TravelAction(
                        action_type="ADD",
                        attraction_id=aid,
                        day=current_day + 1,
                        time_slot=next_start,
                        transport_mode=self.transport_mode,
                        cost=entry_fee,
                        duration=duration_min,
                        travel_time=travel_t,
                    )
                    actions.append(action)

        # Option to advance to next day
        if current_day < self.days:
            actions.append(TravelAction(
                action_type="ADVANCE_DAY",
                day=current_day + 1,
                time_slot=self.start_time,
            ))

        return actions

    def apply_action(self, state: TravelState, action: TravelAction) -> TravelState:
        """Return a new state after applying the action."""
        import copy
        new_visited = list(state.visited_attractions)
        new_activities = list(state.scheduled_activities)
        new_budget = state.remaining_budget
        new_cost = state.total_cost
        new_time_used = dict(state.day_time_used)

        if action.action_type == "ADD":
            new_visited.append(action.attraction_id)
            new_budget -= action.cost
            new_cost += action.cost
            end_time = action.time_slot + action.duration
            new_activities.append({
                "day": action.day,
                "attraction_id": action.attraction_id,
                "start_time": action.time_slot,
                "end_time": end_time,
                "duration": action.duration,
                "cost": action.cost,
                "travel_time": action.travel_time,
                "transport_mode": action.transport_mode,
            })
            # Advance time
            new_current_time = end_time
            new_current_day = action.day
            new_location = action.attraction_id
            new_time_used[action.day] = new_time_used.get(action.day, 0) + action.duration + action.travel_time

            return TravelState(
                destination=state.destination,
                current_day=new_current_day,
                current_time=new_current_time,
                current_location=new_location,
                visited_attractions=new_visited,
                remaining_budget=new_budget,
                scheduled_activities=new_activities,
                total_cost=new_cost,
                total_time=state.total_time + action.duration + action.travel_time,
                day_time_used=new_time_used,
            )

        elif action.action_type == "ADVANCE_DAY":
            new_time_used[action.day] = new_time_used.get(action.day, 0)
            return TravelState(
                destination=state.destination,
                current_day=action.day,
                current_time=action.time_slot,
                current_location=state.current_location,
                visited_attractions=new_visited,
                remaining_budget=new_budget,
                scheduled_activities=new_activities,
                total_cost=new_cost,
                total_time=state.total_time,
                day_time_used=new_time_used,
            )

        return state

    def is_goal(self, state: TravelState) -> bool:
        """
        Goal: visited at least (days * 2) attractions, budget not exceeded,
        and either all days used or no more feasible actions exist.
        """
        min_attractions = max(1, self.days * 2)
        if len(state.visited_attractions) < min_attractions:
            return False
        if state.remaining_budget < 0:
            return False
        return True

    def path_cost(
        self,
        cost: float,
        state: TravelState,
        action: TravelAction,
        next_state: TravelState,
    ) -> float:
        """
        Actual path cost: penalize high monetary cost and long travel times.
        Reward visiting preferred attractions (lower cost = more preferred).
        """
        monetary_cost = action.cost
        time_cost = action.travel_time * 2.0   # 2 rupees per travel minute (opportunity cost)
        # Preference reward: subtract value of visiting preferred attraction
        pref_score = self.preference_scores.get(action.attraction_id, 0.5)
        preference_reward = pref_score * 100   # up to 100 "reward" points

        step_cost = monetary_cost + time_cost - preference_reward
        return cost + max(0.0, step_cost)

    def heuristic(self, state: TravelState) -> float:
        """
        A* heuristic: admissible estimate of remaining cost.
        Uses the cheapest unvisited attractions' entry fees + estimated travel time.
        """
        visited_set = set(state.visited_attractions)
        unvisited = [a for a in self.attractions if a["id"] not in visited_set]

        if not unvisited:
            return 0.0

        min_attractions_needed = max(0, self.days * 2 - len(state.visited_attractions))
        if min_attractions_needed == 0:
            return 0.0

        # Sort by entry_fee ascending (admissible: cheapest possible remaining cost)
        unvisited_sorted = sorted(unvisited, key=lambda a: a.get("entry_fee", 0))
        needed = unvisited_sorted[:min_attractions_needed]

        h = sum(a.get("entry_fee", 0) for a in needed)

        # Add minimum travel time estimate (nearest neighbor distances)
        clat, clng = self._get_location_coords(state.current_location)
        if needed:
            # Estimate travel to nearest needed attraction
            min_dist = min(
                _haversine_km(clat, clng, a.get("lat", clat), a.get("lng", clng))
                for a in needed
            )
            h += _travel_minutes(min_dist, self.transport_mode) * 2.0

        return h
