"""
User Preference Agent: Evaluates individual and group traveler profiles,
runs forward chaining inference, filters candidates, and balances multi-user preferences.
"""

from typing import Dict, List, Any
from app.agents.base_agent import BaseAgent
from app.ai_engine.knowledge_base.inference_engine import InferenceEngine


class UserPreferenceAgent(BaseAgent):
    """
    Agent B: User Preference Agent.
    Transforms raw user constraints into prioritized preference scores and candidate lists
    using forward chaining rule-based inference.
    """

    def __init__(self, inference_engine: InferenceEngine = None):
        super().__init__(
            name="UserPreferenceAgent",
            role="Preference & Constraint Evaluator",
            description="Analyzes traveler interests, budgets, diets, physical limits, and applies rule-based inference."
        )
        self.inference_engine = inference_engine or InferenceEngine()

    def get_peas(self) -> Dict[str, str]:
        return {
            "Performance_Measure": "Preference satisfaction index, zero violation of hard dietary/accessibility constraints, group compromise balance.",
            "Environment": "User travel preferences, group member profiles, candidate attractions and dining venues.",
            "Actuators": "Forward Chaining inference rules, preference score weightings, hard-constraint filters.",
            "Sensors": "Interests list, budget tier, walking comfort tier, dietary flags, group survey data."
        }

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self.status = "active"
        trip_params = context.get("trip_params", {})
        raw_attractions = context.get("raw_attractions", [])
        raw_restaurants = context.get("raw_restaurants", [])
        group_members = trip_params.get("group_members", [])

        self.log(f"Evaluating user profile: Budget ₹{trip_params.get('budget')}, Interests: {trip_params.get('interests')}.")

        # Handle group preference aggregation if present
        aggregated_interests = list(trip_params.get("interests", []))
        if group_members and len(group_members) > 1:
            self.log(f"Detected group travel with {len(group_members)} travelers. Running weighted preference aggregation...")
            member_interests_count: Dict[str, int] = {}
            for m in group_members:
                for inter in m.get("interests", []):
                    member_interests_count[inter] = member_interests_count.get(inter, 0) + 1
            # Add interests favored by at least 1 member
            aggregated_interests = list(set(aggregated_interests + list(member_interests_count.keys())))
            context["group_agreement_ratio"] = max(member_interests_count.values(), default=1) / len(group_members)
            self.log(f"Group consensus interests identified: {aggregated_interests}")

        eval_params = dict(trip_params)
        eval_params["interests"] = aggregated_interests

        # 1. Hard filter attractions
        valid_attractions, rejected_attractions = self.inference_engine.filter_attractions(
            raw_attractions, eval_params, context
        )
        self.log(f"Constraint filtering: {len(valid_attractions)} valid attractions retained, {len(rejected_attractions)} pruned.")

        # 2. Score attractions via Forward Chaining
        scored_attractions = self.inference_engine.score_and_rank_attractions(
            valid_attractions, eval_params, context
        )
        top_name = scored_attractions[0]["name"] if scored_attractions else "None"
        self.log(f"Top-ranked attraction by AI inference: '{top_name}' (score: {scored_attractions[0]['ai_score'] if scored_attractions else 0}).")

        # 3. Filter and rank restaurants
        scored_restaurants = self.inference_engine.filter_and_rank_restaurants(
            raw_restaurants, eval_params
        )
        self.log(f"Dietary matching: {len(scored_restaurants)} verified dining locations approved.")

        self.status = "completed"
        return {
            "scored_attractions": scored_attractions,
            "rejected_attractions": rejected_attractions,
            "scored_restaurants": scored_restaurants,
            "effective_preferences": eval_params
        }

