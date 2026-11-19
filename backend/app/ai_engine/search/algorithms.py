"""
Search Algorithms implementation: BFS, DFS, UCS, Greedy Best-First, and A*.
Provides full tracking of nodes, frontier, path cost, heuristic, and step-by-step
visualization data for academic evaluation and user exploration.
"""

import time
import heapq
from collections import deque
from typing import Dict, List, Any, Optional, Set, Tuple
from app.ai_engine.search.state import TravelProblem, TravelState, TravelAction


class SearchNode:
    """Represents a node in the search tree."""
    def __init__(
        self,
        state: TravelState,
        parent: Optional['SearchNode'] = None,
        action: Optional[TravelAction] = None,
        g_cost: float = 0.0,
        h_cost: float = 0.0,
        depth: int = 0,
        node_id: int = 0
    ):
        self.state = state
        self.parent = parent
        self.action = action
        self.g_cost = g_cost
        self.h_cost = h_cost
        self.f_cost = g_cost + h_cost
        self.depth = depth
        self.node_id = node_id

    def __lt__(self, other: 'SearchNode') -> bool:
        if abs(self.f_cost - other.f_cost) > 1e-6:
            return self.f_cost < other.f_cost
        return self.node_id < other.node_id

    def get_path(self) -> List[Dict[str, Any]]:
        """Reconstruct the sequence of states and actions from root to this node."""
        path = []
        curr: Optional[SearchNode] = self
        while curr is not None:
            path.append({
                "node_id": curr.node_id,
                "state": curr.state.to_dict(),
                "action": curr.action.to_dict() if curr.action else None,
                "g_cost": round(curr.g_cost, 2),
                "h_cost": round(curr.h_cost, 2),
                "f_cost": round(curr.f_cost, 2),
                "depth": curr.depth
            })
            curr = curr.parent
        path.reverse()
        return path

    def to_dict(self, is_goal: bool = False) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "parent_id": self.parent.node_id if self.parent else None,
            "depth": self.depth,
            "g_cost": round(self.g_cost, 2),
            "h_cost": round(self.h_cost, 2),
            "f_cost": round(self.f_cost, 2),
            "is_goal": is_goal,
            "state_summary": self.state.summary(),
            "location": self.state.current_location,
            "day": self.state.current_day,
            "time_str": self.state.to_dict()["current_time_str"],
            "remaining_budget": round(self.state.remaining_budget, 2),
            "visited_count": len(self.state.visited_attractions),
            "action": self.action.to_dict() if self.action else None
        }


def _state_key(state: TravelState) -> Tuple:
    return (
        state.current_day,
        state.current_time,
        state.current_location,
        tuple(sorted(state.visited_attractions)),
        round(state.remaining_budget, -2)  # discretize budget slightly to limit state explosion
    )


def astar(problem: TravelProblem, max_nodes: int = 2500) -> Dict[str, Any]:
    """
    A* Search Algorithm: f(n) = g(n) + h(n).
    Primary search algorithm for optimal constraint-guided itinerary search.
    """
    start_time = time.perf_counter()
    initial_state = problem.get_initial_state()
    h_init = problem.heuristic(initial_state)

    node_counter = 0
    root = SearchNode(
        state=initial_state,
        parent=None,
        action=None,
        g_cost=0.0,
        h_cost=h_init,
        depth=0,
        node_id=node_counter
    )

    # Priority queue storing (f_cost, tiebreaker, node)
    frontier = []
    heapq.heappush(frontier, (root.f_cost, node_counter, root))
    
    explored_states: Set[Tuple] = set()
    explored_nodes_log: List[Dict[str, Any]] = []
    frontier_snapshots: List[Dict[str, Any]] = []
    nodes_per_step: List[Dict[str, Any]] = []

    best_node = root
    goal_node: Optional[SearchNode] = None

    while frontier and len(explored_nodes_log) < max_nodes:
        f, _, current = heapq.heappop(frontier)

        # Snapshot current frontier for step-by-step UI visualization
        if len(explored_nodes_log) < 40 or len(frontier) <= 5:
            frontier_sample = [
                {"node_id": item[2].node_id, "f_cost": round(item[2].f_cost, 2), "summary": item[2].state.summary()}
                for item in sorted(frontier, key=lambda x: x[0])[:8]
            ]
            frontier_snapshots.append({
                "step": len(explored_nodes_log) + 1,
                "current_node_id": current.node_id,
                "frontier_size": len(frontier) + 1,
                "sample": frontier_sample
            })

        s_key = _state_key(current.state)
        if s_key in explored_states:
            continue
        explored_states.add(s_key)

        is_goal = problem.is_goal(current.state)
        node_dict = current.to_dict(is_goal=is_goal)
        explored_nodes_log.append(node_dict)

        nodes_per_step.append({
            "step": len(explored_nodes_log),
            "node_id": current.node_id,
            "parent_id": current.parent.node_id if current.parent else None,
            "depth": current.depth,
            "f_cost": round(current.f_cost, 2),
            "g_cost": round(current.g_cost, 2),
            "h_cost": round(current.h_cost, 2),
            "state_summary": current.state.summary(),
            "is_goal": is_goal
        })

        if is_goal:
            goal_node = current
            break

        # Track the deepest/most comprehensive state visited as fallback
        if len(current.state.visited_attractions) > len(best_node.state.visited_attractions):
            best_node = current

        # Generate successors
        actions = problem.get_actions(current.state)
        for act in actions:
            next_state = problem.apply_action(current.state, act)
            next_key = _state_key(next_state)
            if next_key in explored_states:
                continue

            step_cost = problem.path_cost(0.0, current.state, act, next_state)
            next_g = current.g_cost + step_cost
            next_h = problem.heuristic(next_state)

            node_counter += 1
            child = SearchNode(
                state=next_state,
                parent=current,
                action=act,
                g_cost=next_g,
                h_cost=next_h,
                depth=current.depth + 1,
                node_id=node_counter
            )
            heapq.heappush(frontier, (child.f_cost, node_counter, child))

    target_node = goal_node or best_node
    exec_time_ms = (time.perf_counter() - start_time) * 1000.0

    return {
        "algorithm": "A*",
        "solution_found": goal_node is not None,
        "solution_path": target_node.get_path(),
        "final_state": target_node.state.to_dict(),
        "initial_state": initial_state.to_dict(),
        "total_explored": len(explored_nodes_log),
        "execution_time_ms": round(exec_time_ms, 2),
        "path_cost": round(target_node.g_cost, 2),
        "heuristic_cost": round(target_node.h_cost, 2),
        "evaluation_f": round(target_node.f_cost, 2),
        "explored_nodes": explored_nodes_log[:150],  # UI display limit
        "nodes_per_step": nodes_per_step[:60],
        "frontier_snapshots": frontier_snapshots[:30],
        "scheduled_activities": target_node.state.scheduled_activities
    }


def bfs(problem: TravelProblem, max_nodes: int = 1500) -> Dict[str, Any]:
    """Breadth-First Search (FIFO queue, unweighted, explores level by level)."""
    start_time = time.perf_counter()
    initial_state = problem.get_initial_state()

    node_counter = 0
    root = SearchNode(state=initial_state, node_id=node_counter)
    queue = deque([root])
    explored_states: Set[Tuple] = set()
    explored_nodes_log: List[Dict[str, Any]] = []
    nodes_per_step: List[Dict[str, Any]] = []

    best_node = root
    goal_node: Optional[SearchNode] = None

    while queue and len(explored_nodes_log) < max_nodes:
        current = queue.popleft()
        s_key = _state_key(current.state)
        if s_key in explored_states:
            continue
        explored_states.add(s_key)

        is_goal = problem.is_goal(current.state)
        explored_nodes_log.append(current.to_dict(is_goal=is_goal))
        nodes_per_step.append({
            "step": len(explored_nodes_log),
            "node_id": current.node_id,
            "depth": current.depth,
            "f_cost": current.depth,
            "g_cost": current.depth,
            "h_cost": 0.0,
            "state_summary": current.state.summary(),
            "is_goal": is_goal
        })

        if is_goal:
            goal_node = current
            break

        if len(current.state.visited_attractions) > len(best_node.state.visited_attractions):
            best_node = current

        for act in problem.get_actions(current.state):
            next_state = problem.apply_action(current.state, act)
            next_key = _state_key(next_state)
            if next_key not in explored_states:
                node_counter += 1
                child = SearchNode(
                    state=next_state,
                    parent=current,
                    action=act,
                    g_cost=current.g_cost + 1.0,
                    h_cost=0.0,
                    depth=current.depth + 1,
                    node_id=node_counter
                )
                queue.append(child)

    target_node = goal_node or best_node
    exec_time_ms = (time.perf_counter() - start_time) * 1000.0

    return {
        "algorithm": "BFS",
        "solution_found": goal_node is not None,
        "solution_path": target_node.get_path(),
        "final_state": target_node.state.to_dict(),
        "initial_state": initial_state.to_dict(),
        "total_explored": len(explored_nodes_log),
        "execution_time_ms": round(exec_time_ms, 2),
        "path_cost": round(target_node.g_cost, 2),
        "heuristic_cost": 0.0,
        "evaluation_f": round(target_node.g_cost, 2),
        "explored_nodes": explored_nodes_log[:150],
        "nodes_per_step": nodes_per_step[:60],
        "scheduled_activities": target_node.state.scheduled_activities
    }


def dfs(problem: TravelProblem, max_nodes: int = 1500) -> Dict[str, Any]:
    """Depth-First Search (LIFO stack, explores deep branches first)."""
    start_time = time.perf_counter()
    initial_state = problem.get_initial_state()

    node_counter = 0
    root = SearchNode(state=initial_state, node_id=node_counter)
    stack = [root]
    explored_states: Set[Tuple] = set()
    explored_nodes_log: List[Dict[str, Any]] = []
    nodes_per_step: List[Dict[str, Any]] = []

    best_node = root
    goal_node: Optional[SearchNode] = None

    while stack and len(explored_nodes_log) < max_nodes:
        current = stack.pop()
        s_key = _state_key(current.state)
        if s_key in explored_states:
            continue
        explored_states.add(s_key)

        is_goal = problem.is_goal(current.state)
        explored_nodes_log.append(current.to_dict(is_goal=is_goal))
        nodes_per_step.append({
            "step": len(explored_nodes_log),
            "node_id": current.node_id,
            "depth": current.depth,
            "f_cost": current.depth,
            "g_cost": current.depth,
            "h_cost": 0.0,
            "state_summary": current.state.summary(),
            "is_goal": is_goal
        })

        if is_goal:
            goal_node = current
            break

        if len(current.state.visited_attractions) > len(best_node.state.visited_attractions):
            best_node = current

        # Explore actions
        for act in problem.get_actions(current.state):
            next_state = problem.apply_action(current.state, act)
            next_key = _state_key(next_state)
            if next_key not in explored_states:
                node_counter += 1
                child = SearchNode(
                    state=next_state,
                    parent=current,
                    action=act,
                    g_cost=current.g_cost + 1.0,
                    h_cost=0.0,
                    depth=current.depth + 1,
                    node_id=node_counter
                )
                stack.append(child)

    target_node = goal_node or best_node
    exec_time_ms = (time.perf_counter() - start_time) * 1000.0

    return {
        "algorithm": "DFS",
        "solution_found": goal_node is not None,
        "solution_path": target_node.get_path(),
        "final_state": target_node.state.to_dict(),
        "initial_state": initial_state.to_dict(),
        "total_explored": len(explored_nodes_log),
        "execution_time_ms": round(exec_time_ms, 2),
        "path_cost": round(target_node.g_cost, 2),
        "heuristic_cost": 0.0,
        "evaluation_f": round(target_node.g_cost, 2),
        "explored_nodes": explored_nodes_log[:150],
        "nodes_per_step": nodes_per_step[:60],
        "scheduled_activities": target_node.state.scheduled_activities
    }


def ucs(problem: TravelProblem, max_nodes: int = 1500) -> Dict[str, Any]:
    """Uniform Cost Search (Dijkstra): expands lowest path cost g(n) node."""
    start_time = time.perf_counter()
    initial_state = problem.get_initial_state()

    node_counter = 0
    root = SearchNode(state=initial_state, g_cost=0.0, h_cost=0.0, node_id=node_counter)
    frontier = []
    heapq.heappush(frontier, (root.g_cost, node_counter, root))
    
    explored_states: Set[Tuple] = set()
    explored_nodes_log: List[Dict[str, Any]] = []
    nodes_per_step: List[Dict[str, Any]] = []

    best_node = root
    goal_node: Optional[SearchNode] = None

    while frontier and len(explored_nodes_log) < max_nodes:
        g, _, current = heapq.heappop(frontier)
        s_key = _state_key(current.state)
        if s_key in explored_states:
            continue
        explored_states.add(s_key)

        is_goal = problem.is_goal(current.state)
        explored_nodes_log.append(current.to_dict(is_goal=is_goal))
        nodes_per_step.append({
            "step": len(explored_nodes_log),
            "node_id": current.node_id,
            "depth": current.depth,
            "f_cost": round(current.g_cost, 2),
            "g_cost": round(current.g_cost, 2),
            "h_cost": 0.0,
            "state_summary": current.state.summary(),
            "is_goal": is_goal
        })

        if is_goal:
            goal_node = current
            break

        if len(current.state.visited_attractions) > len(best_node.state.visited_attractions):
            best_node = current

        for act in problem.get_actions(current.state):
            next_state = problem.apply_action(current.state, act)
            next_key = _state_key(next_state)
            if next_key not in explored_states:
                step_cost = problem.path_cost(0.0, current.state, act, next_state)
                node_counter += 1
                child = SearchNode(
                    state=next_state,
                    parent=current,
                    action=act,
                    g_cost=current.g_cost + step_cost,
                    h_cost=0.0,
                    depth=current.depth + 1,
                    node_id=node_counter
                )
                heapq.heappush(frontier, (child.g_cost, node_counter, child))

    target_node = goal_node or best_node
    exec_time_ms = (time.perf_counter() - start_time) * 1000.0

    return {
        "algorithm": "UCS",
        "solution_found": goal_node is not None,
        "solution_path": target_node.get_path(),
        "final_state": target_node.state.to_dict(),
        "initial_state": initial_state.to_dict(),
        "total_explored": len(explored_nodes_log),
        "execution_time_ms": round(exec_time_ms, 2),
        "path_cost": round(target_node.g_cost, 2),
        "heuristic_cost": 0.0,
        "evaluation_f": round(target_node.g_cost, 2),
        "explored_nodes": explored_nodes_log[:150],
        "nodes_per_step": nodes_per_step[:60],
        "scheduled_activities": target_node.state.scheduled_activities
    }


def greedy_best_first(problem: TravelProblem, max_nodes: int = 1500) -> Dict[str, Any]:
    """Greedy Best-First Search: expands node with lowest estimated cost h(n)."""
    start_time = time.perf_counter()
    initial_state = problem.get_initial_state()
    h_init = problem.heuristic(initial_state)

    node_counter = 0
    root = SearchNode(state=initial_state, g_cost=0.0, h_cost=h_init, node_id=node_counter)
    frontier = []
    heapq.heappush(frontier, (root.h_cost, node_counter, root))
    
    explored_states: Set[Tuple] = set()
    explored_nodes_log: List[Dict[str, Any]] = []
    nodes_per_step: List[Dict[str, Any]] = []

    best_node = root
    goal_node: Optional[SearchNode] = None

    while frontier and len(explored_nodes_log) < max_nodes:
        h, _, current = heapq.heappop(frontier)
        s_key = _state_key(current.state)
        if s_key in explored_states:
            continue
        explored_states.add(s_key)

        is_goal = problem.is_goal(current.state)
        explored_nodes_log.append(current.to_dict(is_goal=is_goal))
        nodes_per_step.append({
            "step": len(explored_nodes_log),
            "node_id": current.node_id,
            "depth": current.depth,
            "f_cost": round(current.h_cost, 2),
            "g_cost": round(current.g_cost, 2),
            "h_cost": round(current.h_cost, 2),
            "state_summary": current.state.summary(),
            "is_goal": is_goal
        })

        if is_goal:
            goal_node = current
            break

        if len(current.state.visited_attractions) > len(best_node.state.visited_attractions):
            best_node = current

        for act in problem.get_actions(current.state):
            next_state = problem.apply_action(current.state, act)
            next_key = _state_key(next_state)
            if next_key not in explored_states:
                step_cost = problem.path_cost(0.0, current.state, act, next_state)
                next_h = problem.heuristic(next_state)
                node_counter += 1
                child = SearchNode(
                    state=next_state,
                    parent=current,
                    action=act,
                    g_cost=current.g_cost + step_cost,
                    h_cost=next_h,
                    depth=current.depth + 1,
                    node_id=node_counter
                )
                heapq.heappush(frontier, (child.h_cost, node_counter, child))

    target_node = goal_node or best_node
    exec_time_ms = (time.perf_counter() - start_time) * 1000.0

    return {
        "algorithm": "Greedy Best-First",
        "solution_found": goal_node is not None,
        "solution_path": target_node.get_path(),
        "final_state": target_node.state.to_dict(),
        "initial_state": initial_state.to_dict(),
        "total_explored": len(explored_nodes_log),
        "execution_time_ms": round(exec_time_ms, 2),
        "path_cost": round(target_node.g_cost, 2),
        "heuristic_cost": round(target_node.h_cost, 2),
        "evaluation_f": round(target_node.h_cost, 2),
        "explored_nodes": explored_nodes_log[:150],
        "nodes_per_step": nodes_per_step[:60],
        "scheduled_activities": target_node.state.scheduled_activities
    }


def run_algorithm(algo_name: str, problem: TravelProblem) -> Dict[str, Any]:
    """Helper to dispatch by algorithm name."""
    algo_map = {
        "bfs": bfs,
        "dfs": dfs,
        "ucs": ucs,
        "greedy": greedy_best_first,
        "greedy_best_first": greedy_best_first,
        "astar": astar,
        "a*": astar
    }
    fn = algo_map.get(algo_name.lower().replace("-", "_").replace(" ", "_"), astar)
    return fn(problem)

