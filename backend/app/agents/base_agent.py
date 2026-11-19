"""
Intelligent Agent Framework: Base Agent definition with PEAS specifications
and execution audit logging for multi-agent cooperative travel planning.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
import time


class BaseAgent(ABC):
    """
    Abstract Base Class for specialized AI agents in the TRAVORA Multi-Agent Architecture.
    Includes PEAS (Performance Measure, Environment, Actuators, Sensors) framework definitions.
    """

    def __init__(self, name: str, role: str, description: str):
        self.name = name
        self.role = role
        self.description = description
        self.status: str = "idle"       # "idle", "active", "completed", "error"
        self.execution_logs: List[Dict[str, Any]] = []

    def log(self, message: str, level: str = "INFO", details: Optional[Dict[str, Any]] = None):
        """Append timestamped audit log for the agent activity panel."""
        entry = {
            "timestamp": round(time.time(), 3),
            "time_str": time.strftime("%H:%M:%S"),
            "agent": self.name,
            "level": level,
            "message": message,
            "details": details or {}
        }
        self.execution_logs.append(entry)

    @abstractmethod
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent's autonomous task over shared pipeline context."""
        pass

    @abstractmethod
    def get_peas(self) -> Dict[str, str]:
        """Return the PEAS framework description for academic grading and reporting."""
        pass

    def get_status_info(self) -> Dict[str, Any]:
        """Return real-time agent status."""
        return {
            "name": self.name,
            "role": self.role,
            "description": self.description,
            "status": self.status,
            "log_count": len(self.execution_logs),
            "recent_log": self.execution_logs[-1]["message"] if self.execution_logs else "Ready"
        }

