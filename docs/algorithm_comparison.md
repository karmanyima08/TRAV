# Empirical Search Algorithm Comparison Benchmark

Benchmark evaluating **A\***, **Uniform Cost Search (UCS)**, **Greedy Best-First**, **Breadth-First Search (BFS)**, and **Depth-First Search (DFS)** across 3 realistic city/budget scenarios.

### Objective Cost Function:
$$c(\text{step}) = W_{\text{FEE}} \cdot \text{entry\_fee} + W_{\text{TRANSIT}} \cdot \text{transit\_minutes} + W_{\text{PREF}} \cdot (1 - \text{pref\_norm})$$
where $W_{\text{FEE}} = 0.05$, $W_{\text{TRANSIT}} = 0.5$, $W_{\text{PREF}} = 20.0$.

## Scenario: Jaipur (2 Days, Budget ₹15,000)
- **Candidate Attractions:** 10
- **Goal Requirement:** Minimum 4 attractions within time & budget constraints

| Algorithm | Nodes Expanded | Time (ms) | Path Cost | Goal Found | Optimality Ratio vs UCS |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **A*** | 141 | 15.96 ms | 43.82 | Yes | 1.00x |
| **UCS** | 542 | 58.15 ms | 43.82 | Yes | 1.00x |
| **Greedy Best-First** | 5 | 0.58 ms | 81.65 | Yes | 1.86x |
| **BFS** | 959 | 87.61 ms | 81.65 | Yes | 1.86x |
| **DFS** | 8 | 3.82 ms | 54.82 | Yes | 1.25x |

## Scenario: Delhi (2 Days, Budget ₹20,000)
- **Candidate Attractions:** 8
- **Goal Requirement:** Minimum 4 attractions within time & budget constraints

| Algorithm | Nodes Expanded | Time (ms) | Path Cost | Goal Found | Optimality Ratio vs UCS |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **A*** | 96 | 9.30 ms | 37.47 | Yes | 1.00x |
| **UCS** | 164 | 13.06 ms | 37.47 | Yes | 1.00x |
| **Greedy Best-First** | 5 | 0.28 ms | 98.35 | Yes | 2.62x |
| **BFS** | 561 | 35.77 ms | 98.35 | Yes | 2.62x |
| **DFS** | 6 | 4.64 ms | 56.32 | Yes | 1.50x |

## Scenario: Goa (3 Days, Budget ₹25,000)
- **Candidate Attractions:** 8
- **Goal Requirement:** Minimum 6 attractions within time & budget constraints

| Algorithm | Nodes Expanded | Time (ms) | Path Cost | Goal Found | Optimality Ratio vs UCS |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **A*** | 1462 | 123.09 ms | 97.22 | Yes | 1.00x |
| **UCS** | 1802 | 110.12 ms | 97.22 | Yes | 1.00x |
| **Greedy Best-First** | 7 | 0.47 ms | 267.96 | Yes | 2.76x |
| **BFS** | 2500 | 192.18 ms | 176.98 | Fallback | 1.82x |
| **DFS** | 461 | 13.77 ms | 217.00 | Yes | 2.23x |

## Observations & Analysis
1. **A\* vs UCS (Pruning Efficiency):** A* consistently expands fewer nodes than UCS because the admissible and consistent heuristic $h(n)$ focuses the search frontier directly toward the goal.
2. **Cost Optimality:** Both A* and UCS find paths with identical optimal costs under the objective function. A* achieves this with significantly lower exploration overhead.
3. **Greedy Best-First Tradeoff:** Greedy Best-First expands very few nodes and runs extremely fast, but frequently converges on suboptimal path costs because it ignores accumulated path cost $g(n)$.
4. **BFS & DFS Blind Search:** BFS and DFS ignore costs entirely in their expansion order; BFS expands broadly level-by-level, while DFS dives deeply and often yields much higher path costs.
