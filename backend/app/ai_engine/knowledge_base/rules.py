"""
Knowledge Base Rules: 25+ IF-THEN production rules for Forward Chaining
Inference Engine and Explainable AI (XAI) justification generation.
"""

from typing import Dict, List, Any, Callable
from dataclasses import dataclass


@dataclass
class Rule:
    """Represents an IF-THEN rule in the expert system knowledge base."""
    id: str
    name: str
    category: str        # "preference", "budget", "weather", "time", "dietary", "accessibility", "group", "proximity"
    condition_desc: str  # human-readable antecedent
    action_desc: str     # human-readable consequent
    priority: int        # higher executes earlier
    condition: Callable[[Dict[str, Any], Dict[str, Any], Dict[str, Any]], bool]
    action: Callable[[Dict[str, Any], Dict[str, Any], Dict[str, Any], List[str]], float]


# The Rule Base (28 distinct executable IF-THEN rules)
RULES: List[Rule] = [
    # --- Category 1: Interest & Preference Matching ---
    Rule(
        id="R001",
        name="Historical_Interest_Boost",
        category="preference",
        condition_desc="IF user interests contain 'historical' AND attraction category is 'historical'",
        action_desc="THEN increase attraction preference score by +0.35 and mark historical interest match",
        priority=10,
        condition=lambda attr, prefs, ctx: "historical" in prefs.get("interests", []) and attr.get("category") == "historical",
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Strongly recommended because it matches your selected interest in historical monuments."), 0.35)[1]
    ),
    Rule(
        id="R002",
        name="Nature_Adventure_Boost",
        category="preference",
        condition_desc="IF user interests contain 'nature' or 'adventure' AND attraction is nature or adventure",
        action_desc="THEN increase attraction preference score by +0.30",
        priority=10,
        condition=lambda attr, prefs, ctx: any(i in ["nature", "adventure"] for i in prefs.get("interests", [])) and attr.get("category") in ["nature", "adventure"],
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Recommended for its scenic natural landscapes and outdoor adventure appeal."), 0.30)[1]
    ),
    Rule(
        id="R003",
        name="Cultural_Heritage_Match",
        category="preference",
        condition_desc="IF user interests contain 'cultural' AND attraction is cultural or museum",
        action_desc="THEN increase preference score by +0.25",
        priority=9,
        condition=lambda attr, prefs, ctx: "cultural" in prefs.get("interests", []) and (attr.get("category") == "cultural" or "museum" in attr.get("tags", [])),
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Selected because of its authentic cultural exhibition and artistic value."), 0.25)[1]
    ),
    Rule(
        id="R004",
        name="Religious_Spiritual_Match",
        category="preference",
        condition_desc="IF user interests contain 'religious' or 'spiritual' AND attraction is religious",
        action_desc="THEN increase preference score by +0.30",
        priority=9,
        condition=lambda attr, prefs, ctx: any(i in ["religious", "spiritual"] for i in prefs.get("interests", [])) and attr.get("category") == "religious",
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Highlighted to fulfill your spiritual and temple architecture preferences."), 0.30)[1]
    ),
    Rule(
        id="R005",
        name="Beach_Leisure_Match",
        category="preference",
        condition_desc="IF user interests contain 'beaches' AND attraction category is 'beach'",
        action_desc="THEN increase preference score by +0.35",
        priority=10,
        condition=lambda attr, prefs, ctx: any(i in ["beaches", "beach"] for i in prefs.get("interests", [])) and attr.get("category") == "beach",
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Selected for premier coastal relaxation, sunset vistas, and beach activities."), 0.35)[1]
    ),
    Rule(
        id="R006",
        name="Shopping_Bazaar_Match",
        category="preference",
        condition_desc="IF user interests contain 'shopping' AND attraction is shopping or market",
        action_desc="THEN increase preference score by +0.25",
        priority=8,
        condition=lambda attr, prefs, ctx: "shopping" in prefs.get("interests", []) and attr.get("category") == "shopping",
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Scheduled for vibrant traditional artisan markets and souvenir shopping."), 0.25)[1]
    ),
    Rule(
        id="R007",
        name="Culinary_Street_Food_Match",
        category="preference",
        condition_desc="IF user interests contain 'food' or 'culinary' AND attraction has food tag",
        action_desc="THEN increase preference score by +0.30",
        priority=9,
        condition=lambda attr, prefs, ctx: any(i in ["food", "culinary"] for i in prefs.get("interests", [])) and "food" in attr.get("tags", []),
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Included as a famous culinary hotspot for authentic regional gastronomic experiences."), 0.30)[1]
    ),
    Rule(
        id="R008",
        name="UNESCO_World_Heritage_Priority",
        category="preference",
        condition_desc="IF attraction is designated UNESCO World Heritage Site",
        action_desc="THEN boost score by +0.20 as high-significance monument",
        priority=7,
        condition=lambda attr, prefs, ctx: "unesco" in attr.get("tags", []),
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Prioritized as a globally recognized UNESCO World Heritage monument."), 0.20)[1]
    ),

    # --- Category 2: Budget Constraints & Filtering ---
    Rule(
        id="R009",
        name="Budget_Category_Tier_Match",
        category="budget",
        condition_desc="IF user budget category matches attraction budget category",
        action_desc="THEN boost score by +0.20",
        priority=8,
        condition=lambda attr, prefs, ctx: attr.get("budget_category") == prefs.get("budget_category", "mid"),
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Pricing category perfectly aligns with your designated {prefs.get('budget_category', 'mid')} travel tier."), 0.20)[1]
    ),
    Rule(
        id="R010",
        name="Strict_Budget_Low_Cost_Favor",
        category="budget",
        condition_desc="IF user total budget is below ₹10,000 AND attraction has 0 or minimal entry fee (<= ₹200)",
        action_desc="THEN favor attraction with +0.25 score to preserve expenditure",
        priority=12,
        condition=lambda attr, prefs, ctx: float(prefs.get("budget", 20000)) <= 10000 and attr.get("entry_fee", 0) <= 200,
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Cost-efficient choice: zero or low entry fee fits comfortably within tight budget constraints."), 0.25)[1]
    ),
    Rule(
        id="R011",
        name="High_Fee_Penalty_On_Low_Budget",
        category="budget",
        condition_desc="IF user budget is below ₹15,000 AND attraction entry fee > ₹800",
        action_desc="THEN apply penalization score -0.40 to avoid budget exhaustion",
        priority=13,
        condition=lambda attr, prefs, ctx: float(prefs.get("budget", 20000)) < 15000 and attr.get("entry_fee", 0) > 800,
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Caution: Higher entry fee (₹{attr.get('entry_fee')}) requires significant share of budget."), -0.40)[1]
    ),

    # --- Category 3: Weather Adaptability ---
    Rule(
        id="R012",
        name="Rainy_Weather_Indoor_Boost",
        category="weather",
        condition_desc="IF current weather is 'rainy' AND attraction is indoor/sheltered",
        action_desc="THEN prioritize indoor museum or palace with +0.35 boost",
        priority=15,
        condition=lambda attr, prefs, ctx: ctx.get("weather", "sunny") == "rainy" and (attr.get("indoor", False) or "rainy" in attr.get("suitable_weather", [])),
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Ideal weather adaptation: indoor sheltered venue chosen to stay dry during rainy conditions."), 0.35)[1]
    ),
    Rule(
        id="R013",
        name="Rainy_Weather_Outdoor_Deprecate",
        category="weather",
        condition_desc="IF current weather is 'rainy' AND attraction is strictly outdoor trek or open hillfort",
        action_desc="THEN reduce preference score by -0.45",
        priority=15,
        condition=lambda attr, prefs, ctx: ctx.get("weather", "sunny") == "rainy" and not attr.get("indoor", False) and "rainy" not in attr.get("suitable_weather", []),
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Demoted due to adverse rain conditions for open-air outdoor activities."), -0.45)[1]
    ),
    Rule(
        id="R014",
        name="Sunny_Clear_Viewpoint_Boost",
        category="weather",
        condition_desc="IF weather is sunny/clear AND attraction is panoramic viewpoint or beach",
        action_desc="THEN boost score by +0.20 for great visibility",
        priority=8,
        condition=lambda attr, prefs, ctx: ctx.get("weather", "sunny") in ["sunny", "clear"] and any(t in attr.get("tags", []) for t in ["viewpoint", "sunset", "beach"]),
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Optimal clear sky conditions offer exceptional panoramic visibility and photography."), 0.20)[1]
    ),

    # --- Category 4: Accessibility & Physical Comfort ---
    Rule(
        id="R015",
        name="Wheelchair_Accessibility_Enforcement",
        category="accessibility",
        condition_desc="IF user requires wheelchair accessibility AND attraction is wheelchair friendly",
        action_desc="THEN boost score by +0.35; reject if non-accessible",
        priority=20,
        condition=lambda attr, prefs, ctx: prefs.get("accessibility_required", False) and attr.get("accessibility", False),
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Verified wheelchair accessible ramps and step-free circulation paths."), 0.35)[1]
    ),
    Rule(
        id="R016",
        name="Easy_Walking_Comfort_Preference",
        category="accessibility",
        condition_desc="IF user selects 'easy' walking comfort (<2km/day) AND attraction requires short duration (<= 1.5 hrs)",
        action_desc="THEN boost score by +0.25",
        priority=11,
        condition=lambda attr, prefs, ctx: prefs.get("walking_comfort") == "easy" and attr.get("avg_duration_hours", 2.0) <= 1.5,
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Gentle pacing: compact grounds minimize physical walking fatigue."), 0.25)[1]
    ),
    Rule(
        id="R017",
        name="Active_Trek_Preference",
        category="accessibility",
        condition_desc="IF user selects 'active' walking comfort AND attraction is high-step hillfort/trek",
        action_desc="THEN boost score by +0.20",
        priority=10,
        condition=lambda attr, prefs, ctx: prefs.get("walking_comfort") == "active" and any(t in attr.get("tags", []) for t in ["adventure", "trekking", "fort"]),
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Matches your high physical activity and stamina preference."), 0.20)[1]
    ),

    # --- Category 5: Group Balancing & Dynamics ---
    Rule(
        id="R018",
        name="Family_Friendly_Group_Favor",
        category="group",
        condition_desc="IF traveling with family (children/seniors) AND attraction is family friendly",
        action_desc="THEN boost score by +0.30",
        priority=12,
        condition=lambda attr, prefs, ctx: prefs.get("travel_type") == "family" and attr.get("family_friendly", True),
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Family-safe facilities suitable for travelers of all ages."), 0.30)[1]
    ),
    Rule(
        id="R019",
        name="Multi_Member_Consensus_Boost",
        category="group",
        condition_desc="IF attraction matches interests of multiple group members (> 50% group agreement)",
        action_desc="THEN boost score by +0.30 to maximize group harmony",
        priority=14,
        condition=lambda attr, prefs, ctx: ctx.get("group_agreement_ratio", 0.0) >= 0.5,
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Group consensus: shared favorite across majority of traveling members."), 0.30)[1]
    ),

    # --- Category 6: Geographic Proximity & Efficiency ---
    Rule(
        id="R020",
        name="Cluster_Proximity_Efficiency",
        category="proximity",
        condition_desc="IF distance from previous attraction is under 3.5 km",
        action_desc="THEN reward itinerary efficiency with +0.25 boost",
        priority=11,
        condition=lambda attr, prefs, ctx: ctx.get("distance_from_prev_km", 10.0) <= 3.5,
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Geographically clustered nearby: saves transit time and reduces local commute cost."), 0.25)[1]
    ),
    Rule(
        id="R021",
        name="Long_Transit_Penalization",
        category="proximity",
        condition_desc="IF transit time from previous attraction exceeds 60 minutes",
        action_desc="THEN penalize transition with -0.30",
        priority=11,
        condition=lambda attr, prefs, ctx: ctx.get("transit_minutes", 0) > 60,
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Transit penalty: distant location requiring prolonged travel time."), -0.30)[1]
    ),

    # --- Category 7: Timing & Operating Feasibility ---
    Rule(
        id="R022",
        name="Sunrise_Sunset_Optimal_Scheduling",
        category="time",
        condition_desc="IF attraction is sunset/sunrise viewpoint AND scheduled during dawn/dusk hours",
        action_desc="THEN boost preference score by +0.30",
        priority=10,
        condition=lambda attr, prefs, ctx: "sunset" in attr.get("tags", []) and ctx.get("slot_label") == "evening",
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Scheduled during golden hour for peak atmospheric sunset photography."), 0.30)[1]
    ),
    Rule(
        id="R023",
        name="Evening_Bazaar_Atmosphere",
        category="time",
        condition_desc="IF attraction is traditional bazaar AND slot is evening",
        action_desc="THEN boost score by +0.25 as bazaars thrive after sunset",
        priority=9,
        condition=lambda attr, prefs, ctx: attr.get("category") == "shopping" and ctx.get("slot_label") == "evening",
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Scheduled for evening when market street lights and festive activity peak."), 0.25)[1]
    ),
    Rule(
        id="R024",
        name="Morning_Spiritual_Sacred_Quiet",
        category="time",
        condition_desc="IF attraction is religious/temple AND scheduled for morning slot",
        action_desc="THEN boost score by +0.25 for morning tranquility and morning rituals",
        priority=9,
        condition=lambda attr, prefs, ctx: attr.get("category") == "religious" and ctx.get("slot_label") == "morning",
        action=lambda attr, prefs, ctx, exp: (exp.append(f"Morning slot selected to avoid crowds and participate in authentic early rituals."), 0.25)[1]
    ),

    # --- Category 8: Dietary Enforcement Rules (for dining slots) ---
    Rule(
        id="R025",
        name="Pure_Vegetarian_Strict_Compliance",
        category="dietary",
        condition_desc="IF user diet is Vegetarian AND restaurant serves certified vegetarian dishes",
        action_desc="THEN validate dining selection with +0.30 score",
        priority=18,
        condition=lambda rest, prefs, ctx: "veg" in prefs.get("dietary_restrictions", []) and "veg" in rest.get("dietary_options", []),
        action=lambda rest, prefs, ctx, exp: (exp.append(f"Complies with vegetarian dietary requirements."), 0.30)[1]
    ),
    Rule(
        id="R026",
        name="Jain_Dietary_Strict_Enforcement",
        category="dietary",
        condition_desc="IF user requires Jain food AND restaurant provides Jain culinary menu",
        action_desc="THEN score +0.40 and certify root-free food preparation",
        priority=20,
        condition=lambda rest, prefs, ctx: "jain" in prefs.get("dietary_restrictions", []) and "jain" in rest.get("dietary_options", []),
        action=lambda rest, prefs, ctx, exp: (exp.append(f"Certified Jain preparation adhering strictly to dietary requirements."), 0.40)[1]
    ),
    Rule(
        id="R027",
        name="Halal_Dietary_Compliance",
        category="dietary",
        condition_desc="IF user requires Halal dining AND restaurant certifies Halal culinary menu",
        action_desc="THEN score +0.35 and certify halal menu compliance",
        priority=19,
        condition=lambda rest, prefs, ctx: "halal" in prefs.get("dietary_restrictions", []) and "halal" in rest.get("dietary_options", []),
        action=lambda rest, prefs, ctx, exp: (exp.append(f"Verified Halal cuisine compliance."), 0.35)[1]
    ),
    Rule(
        id="R028",
        name="Vegan_Option_Compliance",
        category="dietary",
        condition_desc="IF user requires Vegan food AND restaurant provides plant-based menu",
        action_desc="THEN score +0.35 and confirm dairy-free plant options",
        priority=19,
        condition=lambda rest, prefs, ctx: "vegan" in prefs.get("dietary_restrictions", []) and "vegan" in rest.get("dietary_options", []),
        action=lambda rest, prefs, ctx, exp: (exp.append(f"Provides verified plant-based vegan meal options."), 0.35)[1]
    )
]

