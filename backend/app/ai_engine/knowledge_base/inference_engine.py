"""
Inference Engine: Forward Chaining rule-based reasoning for attraction scoring,
filtering, dietary matching, and Explainable AI (XAI) transparent justifications.
"""

from typing import Dict, List, Any, Tuple
from app.ai_engine.knowledge_base.rules import RULES, Rule


class InferenceEngine:
    """
    Expert System Forward Chaining Inference Engine.
    Executes production rules over working memory (attractions, trip parameters,
    and context facts) to produce justified recommendations and prune invalid options.
    """

    def __init__(self, rules: List[Rule] = RULES):
        # Sort rules by priority descending
        self.rules = sorted(rules, key=lambda r: r.priority, reverse=True)

    def forward_chain(
        self,
        attraction: Dict[str, Any],
        user_prefs: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Run forward chaining over an individual attraction.
        Returns:
            {
                "score": float,
                "fired_rules": [Rule, ...],
                "explanations": [str, ...]
            }
        """
        base_score = attraction.get("popularity_score", 0.5)
        accumulated_score = base_score
        fired_rules: List[Dict[str, Any]] = []
        explanations: List[str] = []

        for rule in self.rules:
            # Check if condition holds
            try:
                if rule.condition(attraction, user_prefs, context):
                    delta = rule.action(attraction, user_prefs, context, explanations)
                    accumulated_score += delta
                    fired_rules.append({
                        "id": rule.id,
                        "name": rule.name,
                        "category": rule.category,
                        "condition": rule.condition_desc,
                        "action": rule.action_desc,
                        "impact": delta
                    })
            except Exception:
                continue

        # Bound score between 0.05 and 1.00
        bounded_score = max(0.05, min(1.0, accumulated_score))

        return {
            "score": round(bounded_score, 3),
            "base_score": base_score,
            "fired_rules": fired_rules,
            "explanations": explanations
        }

    def score_and_rank_attractions(
        self,
        attractions: List[Dict[str, Any]],
        user_prefs: Dict[str, Any],
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Score all candidate attractions and return them sorted by inference score."""
        scored = []
        for a in attractions:
            inference_res = self.forward_chain(a, user_prefs, context)
            item = dict(a)
            item["ai_score"] = inference_res["score"]
            item["ai_fired_rules"] = inference_res["fired_rules"]
            item["ai_explanations"] = inference_res["explanations"]
            scored.append(item)

        scored.sort(key=lambda x: x["ai_score"], reverse=True)
        return scored

    def filter_attractions(
        self,
        attractions: List[Dict[str, Any]],
        user_prefs: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Filter out hard-infeasible attractions (e.g. accessibility requirement violated,
        entry fee exceeding entire activity budget).
        """
        valid: List[Dict[str, Any]] = []
        rejected: List[Dict[str, Any]] = []

        req_accessibility = user_prefs.get("accessibility_required", False)
        max_budget = float(user_prefs.get("budget", 20000))
        max_single_fee = max_budget * 0.40

        for a in attractions:
            # Check accessibility constraint
            if req_accessibility and not a.get("accessibility", False):
                rejected.append({
                    "attraction": a,
                    "reason": "Excluded: Venue does not provide verified wheelchair accessibility / step-free paths."
                })
                continue

            # Check individual entry fee vs whole budget
            if a.get("entry_fee", 0) > max_single_fee:
                rejected.append({
                    "attraction": a,
                    "reason": f"Excluded: Entry fee of ₹{a.get('entry_fee')} exceeds 40% of total travel budget."
                })
                continue

            valid.append(a)

        return valid, rejected

    def filter_and_rank_restaurants(
        self,
        restaurants: List[Dict[str, Any]],
        user_prefs: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Filter restaurants by dietary restrictions and rank them."""
        dietary_reqs = user_prefs.get("dietary_restrictions", [])
        if isinstance(dietary_reqs, str):
            dietary_reqs = [dietary_reqs]

        valid_rests = []
        for r in restaurants:
            r_opts = r.get("dietary_options", [])
            # If user has dietary restriction, verify compatibility
            if "jain" in dietary_reqs and "jain" not in r_opts:
                continue
            if "veg" in dietary_reqs and "veg" not in r_opts:
                continue
            if "vegan" in dietary_reqs and "vegan" not in r_opts:
                continue
            if "halal" in dietary_reqs and "halal" not in r_opts:
                continue

            # Run forward chaining for restaurants
            res = self.forward_chain(r, user_prefs, {})
            item = dict(r)
            item["ai_score"] = res["score"]
            item["ai_explanations"] = res["explanations"]
            valid_rests.append(item)

        valid_rests.sort(key=lambda x: x["ai_score"], reverse=True)
        return valid_rests

    def explain_recommendation(
        self,
        item_name: str,
        explanations: List[str],
        score: float
    ) -> str:
        """Construct natural language explanation summary."""
        if not explanations:
            return f"{item_name} was selected based on high popularity ({int(score * 100)}% match) and convenient location."
        
        main_reasons = " ".join(explanations[:3])
        return f"{item_name} ({int(score * 100)}% match): {main_reasons}"

