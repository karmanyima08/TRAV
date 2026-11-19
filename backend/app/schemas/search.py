"""
Pydantic Schemas for AI Search and CSP Algorithm Visualizer Endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class SearchRunRequest(BaseModel):
    destination: str = "jaipur"
    algorithm: str = "astar"      # astar, bfs, dfs, ucs, greedy
    num_days: int = Field(default=3, ge=1, le=7)
    budget: float = Field(default=20000.0, ge=1000.0)
    interests: List[str] = Field(default_factory=lambda: ["historical", "cultural"])
    walking_comfort: str = "moderate"
    transport_preference: str = "auto"
    max_nodes: int = 1500


class CSPRunRequest(BaseModel):
    destination: str = "jaipur"
    num_days: int = Field(default=3, ge=1, le=7)
    budget: float = Field(default=20000.0, ge=1000.0)
    interests: List[str] = Field(default_factory=lambda: ["historical"])
    walking_comfort: str = "moderate"
    max_steps: int = 1500

