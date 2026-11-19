# TRAVORA — Intelligent Travel Planning System
### An Intelligent, Constraint-Based and Adaptive Travel Planning System
**University AI Project — Course CSE3705 Artificial Intelligence**  
**Official Project Title:** *Travel & Trip Planner: A Constraint-Based and Adaptive Travel Planning System for Effective Trip Generation*  
**Group:** AI Group 4  
**Team Members:** Gaurang Mudgil (240459), Hardik Sardana (240464), Ishant Rai (240486), Karma Nyima (240502), Himanshu Yadav (240478)  

---

## 1. Project Introduction & Overview

Planning a trip is traditionally an exhausting, fragmented process requiring travelers to juggle 20+ browser tabs across mapping tools, booking platforms, travel blogs, and reviews. Generic LLM itinerary generators frequently generate temporally or geographically impossible schedules—ignoring opening hours, travel fatigue, dietary restrictions, and physical constraints.

**TRAVORA** bridges this gap by implementing an intelligent, deterministic, constraint-guided travel planning engine. The system integrates:
- **Topic 2: State Space Search** ($A^*$ with admissible heuristics, BFS, DFS, UCS, Greedy Best-First)
- **Topic 3: Constraint Satisfaction Problems (CSP)** with Backtracking, MRV, Degree Heuristic, LCV, and Forward Checking
- **Topic 4: Knowledge Representation & Reasoning** with 28 production rules and Forward Chaining inference
- **Topic 5: Intelligent Agents** structured under the formal PEAS framework in a 5-agent cooperative architecture

---

## 2. Key Features

1. **State Space Route Optimization ($A^*$ Search):** Discovers optimal visit order minimizing travel friction and monetary cost.
2. **CSP Feasibility Engine:** Enforces 12 distinct constraints including operating hours, visit durations, no schedule overlaps, and walking tolerance.
3. **Transparent Explainable AI (XAI):** Every scheduled attraction displays natural language justifications indicating which rules and constraints influenced its selection.
4. **Dynamic Itinerary Recovery:** When an activity is flagged closed or rained out, the system isolates and repairs that slot with an optimal alternative while strictly preserving the unaffected days.
5. **Budget What-If Simulator:** Interactive slider allowing travelers to adjust budgets and observe live reallocations across accommodation tiers, food, and attractions.
6. **Group Travel Preference Optimizer:** Balances conflicting interests across multiple travelers using weighted Pareto compromise.
7. **Interactive AI Explorer:** Dedicated educational dashboard with an SVG search space tree and CSP step-by-step backtracking trace.

---

## 3. System Architecture & Multi-Agent Workflow

```
                                  +-----------------------+
                                  |   Traveler Request    |
                                  | (Destination, Budget) |
                                  +-----------+-----------+
                                              |
                                              v
+------------------------------------------------------------------------------------------+
|                                  AGENT COORDINATOR                                       |
|                                                                                          |
|  1. DestinationResearchAgent  --> Extracts POIs & operational hours from Knowledge Base  |
|  2. UserPreferenceAgent       --> Runs Forward Chaining inference & scores attractions    |
|  3. ItineraryPlanningAgent    --> Executes A* State Space Search (f = g + h)             |
|  4. ConstraintValidationAgent --> Enforces CSP scheduling via Backtracking + MRV/LCV/FC   |
|  5. OptimizationRecoveryAgent --> Optimizes local routes & provides dynamic recovery     |
+------------------------------------------------------------------------------------------+
                                              |
                                              v
                                  +-----------------------+
                                  |  Feasible Itinerary   |
                                  | (Timeline, XAI, Maps) |
                                  +-----------------------+
```

---

## 4. AI Course Topic Implementations

### A. Topic 2: State Space Search & Problem Solving

The travel planning problem is mathematically formulated as a state space graph:
- **Initial State $S_0$:** Destination selected, current day = 1, time = 9:00 AM (540 min), location = "start", visited = $\emptyset$, remaining budget = $B$.
- **State $S$:** $\langle \text{dest}, \text{day}, \text{time}, \text{location}, \text{visited\_list}, \text{remaining\_budget}, \text{scheduled\_activities} \rangle$.
- **Actions $A$:** `ADD(attraction_id)`, `SELECT_TRANSPORT`, `ADVANCE_DAY`.
- **Transition Model $T(S, A)$:** Updates current time by activity duration plus transit time, deducts entry fee from remaining budget, and appends the attraction to the visited list.
- **Goal State $G$:** At least $(\text{days} \times 2)$ attractions scheduled within budget and operational time limits.
- **Path Cost $g(n)$:**
  $$g(n) = \sum \Big(\text{entry\_fee} + 2.0 \times \text{transit\_minutes} - 100 \times \text{preference\_score}\Big)$$
- **Admissible Heuristic $h(n)$:**
  $$h(n) = \sum_{k=1}^{\text{needed}} \min(\text{unvisited entry fees}) + 2.0 \times \text{min\_transit\_minutes}$$
  Because $h(n)$ assumes the cheapest remaining attractions with minimal straight-line transit time, $h(n) \le h^*(n)$, guaranteeing that **$A^*$ Search is admissible and optimal**.

**Implemented Search Algorithms:**
1. `astar(problem)` — Primary evaluation: $f(n) = g(n) + h(n)$
2. `greedy_best_first(problem)` — Evaluation: $f(n) = h(n)$
3. `ucs(problem)` — Uniform Cost Search (Dijkstra): $f(n) = g(n)$
4. `bfs(problem)` — Breadth-First Search (FIFO queue)
5. `dfs(problem)` — Depth-First Search (LIFO stack)

---

### B. Topic 3: Constraint Satisfaction Problems (CSP)

Scheduling activities across daily time windows is modeled as a formal CSP:
- **Variables ($X$):** $\text{slot\_d}\{d\}\_\{\text{morning | afternoon | evening}\}$ for days $d \in \{1 \dots N\}$.
- **Domains ($D$):** Candidate attractions for the destination + `FREE` (leisure slot).
- **Constraints ($C$):**
  1. *No Duplicates:* $\forall i \neq j: X_i \neq X_j$ (except `FREE`).
  2. *Budget Bound:* $\sum \text{cost}(X_i) \le 0.40 \times \text{Total Budget}$.
  3. *Operating Hours:* $\text{open}(X_i) \le \text{start}(X_i)$ and $\text{close}(X_i) \ge \text{end}(X_i)$.
  4. *Visit Duration:* $\text{duration}(X_i) \le \text{window\_capacity}(X_i)$.
  5. *Closed Days:* $\text{day}(X_i) \notin \text{closed\_days}(X_i)$.
  6. *Walking Comfort:* High physical activity slots per day $\le$ user walking threshold.

**CSP Solving Techniques:**
- **Backtracking Search:** Recursive trial-and-error state assignment.
- **Minimum Remaining Values (MRV):** Variable ordering heuristic selecting the unassigned slot with the fewest valid domain options.
- **Degree Heuristic:** Breaks MRV ties by picking the variable with the highest number of constraints on remaining unassigned variables.
- **Least Constraining Value (LCV):** Value ordering heuristic sorting domain values by the least number of choices pruned from neighbor domains.
- **Forward Checking:** Prunes domain values from unassigned neighbor variables whenever an assignment is made, detecting domain wipeouts before descent.

---

### C. Topic 4: Knowledge Representation & Reasoning

Structured expert knowledge is represented in `app/ai_engine/knowledge_base/` using facts and production rules:
- **Facts:** Detailed profiles for 10 Indian tourist cities (Jaipur, Delhi, Goa, Agra, Varanasi, Udaipur, etc.), containing exact coordinates, operating hours, ticket fees, weather profiles, accessibility ratings, and dining specialties.
- **Rule Base:** 28 executable IF-THEN rules categorized into Interest Matching, Budget Tiers, Weather Adaptability, Physical Comfort, Accessibility, Group Dynamics, and Dietary Restrictions.
- **Forward Chaining Inference Engine:** Fires applicable rules over working memory until convergence, outputting composite scores and natural language justifications.

---

### D. Topic 5: Intelligent Agents & PEAS Framework

| Agent | Performance Measure | Environment | Actuators | Sensors |
|---|---|---|---|---|
| **DestinationResearchAgent** | Completeness of POI catalog, geographic coverage | Knowledge Base facts, operational calendars | POI metadata enricher, category indexer | Destination query, weather status |
| **UserPreferenceAgent** | Preference satisfaction index, zero dietary violations | Traveler constraints, group survey profiles | Forward Chaining inference, candidate pruning | Budget, walking tolerance, dietary flags |
| **ItineraryPlanningAgent** | Minimized path cost $f(n)$, zero deadline overrun | Discrete state space of travel states | State transitions (ADD, ADVANCE_DAY) | Attraction coordinates, visiting durations |
| **ConstraintValidationAgent**| 100% constraint compliance, minimal backtracks | Slot variables, attraction domains, 12 constraints| Slot assignment, domain pruning via FC | Operating hours, slot capacity, budget |
| **OptimizationRecoveryAgent** | Minimized transit distance (km), zero schedule shock | Day-wise schedule, real-world disruption flags | Tour re-sequencing, local slot substitution | Disruption event, distance matrix |

---

## 5. Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React, Recharts, React Router v6, Vite.
- **Backend:** Python 3.11, FastAPI, Pydantic v2, Motor (Async MongoDB Driver), Python-Jose, Pytest.
- **Database:** MongoDB (with resilient in-memory dual-layer storage for offline/demo execution).

---

## 6. How to Run Locally

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Start the Backend API Server
```powershell
cd "c:\Users\admin\Desktop\AI project\backend"
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend will start at: `http://127.0.0.1:8000`  
Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`

### 2. Start the Frontend Application
```powershell
cd "c:\Users\admin\Desktop\AI project\frontend"
npm install
npm run dev
```
The React frontend will be available at: `http://127.0.0.1:5173`

### 3. Run AI Algorithm Unit Tests
```powershell
cd "c:\Users\admin\Desktop\AI project\backend"
python -m pytest tests/test_ai_algorithms.py -v
```

---

## 7. Sample Test Scenarios

- **Scenario 1: Individual Jaipur Travel:** Select Jaipur, 3 Days, ₹20,000 budget, historical interest. The engine generates Amber Fort, Hawa Mahal, City Palace, and Jal Mahal in geographically optimized order.
- **Scenario 2: Budget Constraint:** Reduce budget to ₹8,000. The engine prunes high-ticket venues and schedules free or budget-tier cultural landmarks.
- **Scenario 3: Dynamic Recovery:** In the itinerary view, click "Replace" on any monument (e.g. Amber Fort) and select "Monument Closed for Renovation". The recovery agent replaces it with Nahargarh Fort, preserving all other slots.
- **Scenario 4: Search Space Visualizer:** Open `/ai-explorer` and click "Execute Algorithm". Step through nodes to watch $g(n)$, $h(n)$, and $f(n)$ update live.
- **Scenario 5: CSP Backtracking Trace:** In `/ai-explorer`, open the CSP tab and click "Solve via Backtracking + MRV" to inspect domain reductions and variable assignments.

