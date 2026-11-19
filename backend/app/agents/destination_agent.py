"""
Destination Research Agent: Analyzes destinations, retrieves points of interest,
categorizes attractions, and enriches data with geographical & operational knowledge.
"""

from typing import Dict, List, Any
from app.agents.base_agent import BaseAgent
from app.ai_engine.knowledge_base.facts import DESTINATIONS, ATTRACTIONS, RESTAURANTS


class DestinationResearchAgent(BaseAgent):
    """
    Agent A: Destination Research Agent.
    Retrieves and synthesizes structured destination facts from the Knowledge Base.
    """

    def __init__(self):
        super().__init__(
            name="DestinationResearchAgent",
            role="Destination & POI Researcher",
            description="Explores target city geography, retrieves attractions, operating schedules, entry fees, and weather profiles."
        )

    def get_peas(self) -> Dict[str, str]:
        return {
            "Performance_Measure": "Completeness of POI catalog, geographic coverage ratio, accurate operational hours, weather awareness.",
            "Environment": "Knowledge Base facts, destination profiles, geographical coordinates, weather status.",
            "Actuators": "Attraction catalog filters, POI metadata enricher, category indexer.",
            "Sensors": "Destination ID query, season/weather parameters, operating calendar."
        }

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self.status = "active"
        dest_id = context.get("destination_id", "jaipur").lower().strip()
        self.log(f"Initiating destination research for '{dest_id}'...")

        dest_info = DESTINATIONS.get(dest_id)
        if not dest_info:
            # Fallback to Jaipur if not found
            self.log(f"Destination '{dest_id}' not found in KB, defaulting to Jaipur.", level="WARNING")
            dest_id = "jaipur"
            dest_info = DESTINATIONS["jaipur"]

        # Fetch attractions for this destination
        city_attractions = [a for a in ATTRACTIONS if a["destination_id"] == dest_id]
        city_restaurants = [r for r in RESTAURANTS if r["destination_id"] == dest_id]

        self.log(f"Retrieved {len(city_attractions)} attractions and {len(city_restaurants)} dining venues for {dest_info['name']}.")

        # Categorize
        categories = {}
        for a in city_attractions:
            cat = a.get("category", "general")
            categories[cat] = categories.get(cat, 0) + 1

        self.log(f"Categorization complete: {dict(categories)}.")
        self.status = "completed"

        return {
            "destination": dest_info,
            "raw_attractions": city_attractions,
            "raw_restaurants": city_restaurants,
            "categories": categories,
            "weather": context.get("weather", "sunny")
        }

