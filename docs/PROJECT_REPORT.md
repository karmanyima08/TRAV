# TRAVORA: Intelligent Constraint-Based and Adaptive Travel Planning System
## Academic Project Report — CSE3705 Artificial Intelligence

---

### Table of Contents
1. **Introduction**
   - What is TRAVORA?
   - Problem Statement
   - Objective
   - Motivation
   - Significance
   - Challenges
   - Novelty Proposed
2. **Literature Review**
3. **Methodology**
4. **Travel Planning as State-Space Search**
   - Problem & Problem Description
   - State-Space Representation
   - State, Initial State, Goal State, Actions
   - Transition Model & Path Cost Formulation
   - Admissible & Consistent Heuristic Formulation
   - Search Algorithms Applied
5. **Travel Planning as Constraint Satisfaction Problem (CSP)**
   - Variables, Domains, and Constraints
   - Constraint Types (Unary, Binary, Global)
   - Solving Techniques (Backtracking, MRV, Degree Heuristic, LCV, Forward Checking)
6. **CSP for a Particular Travel Instance**
   - Concrete Instance: 2-Day Cultural Tour in Jaipur
   - Variables & Domain Assignment Matrix
   - Constraint Satisfaction Execution Walkthrough
7. **Implementation**
   - a. Rule-Based Expert System (Knowledge Base & Forward Chaining)
   - b. Uninformed Search Strategies (BFS, DFS, Uniform Cost Search)
   - c. Informed Heuristic Search ($A^*$ Algorithm)
   - d. Multi-Agent Architecture (PEAS Cooperative Agents)
8. **Results & Performance Evaluation**
   - Empirical Benchmark Tables (Jaipur, Delhi, Goa)
   - Comparative Performance Analysis (Nodes, Time, Cost, Optimality)
   - Verification of Heuristic Admissibility & Consistency
9. **Discussion**
   - Algorithmic Trade-offs & Search Pruning
   - Heuristic Design & Resolution of the Negative Cost Flaw
   - Traveler-Centric Abstraction vs Academic Rigor
10. **Conclusion**
11. **References**

---

# 1. Introduction

### What is TRAVORA?
TRAVORA is an intelligent, constraint-based travel planning system designed to automate the generation of optimized, multi-day travel itineraries. Unlike conventional travel aggregators that present disjointed lists of attractions or modern large language models that suffer from hallucinations, unrealistic travel timings, and budget drift, TRAVORA formulates itinerary generation through deterministic Artificial Intelligence paradigms: **State-Space Search**, **Constraint Satisfaction Problems (CSP)**, **Forward-Chaining Knowledge Bases**, and **Autonomous Multi-Agent Systems**.

### Problem Statement
Planning a personalized multi-day trip is an NP-hard combinatorial optimization challenge akin to the Orienteering Problem with Time Windows (OPTW). A traveler must select an ordered subset of attractions from hundreds of candidates while simultaneously satisfying complex, interconnected constraints:
1. Strict fiscal budget limits across activities, meals, and local transit.
2. Rigid operating time windows, seasonal closures, and prayer/maintenance breaks.
3. Daily physical stamina and fatigue thresholds.
4. Dietary preferences (e.g., Jain, Pure Vegetarian, Halal).
5. Accessibility requirements (e.g., step-free access, wheelchair ramps).
6. Minimization of inter-attraction transit delays and geographical backtracking.

Human travel planning requires hours of manual cross-referencing across disparate websites, frequently resulting in schedule overlaps, excessive commuting fatigue, and budget exhaustion.

### Objective
The primary objective of TRAVORA is to design, implement, and validate an end-to-end artificial intelligence engine capable of:
- Modeling itinerary generation as a formal state-space search problem.
- Formulating and proving an admissible and consistent heuristic $h(n)$ for $A^*$ search that guarantees cost-optimal route sequencing.
- Implementing a robust CSP solver leveraging Backtracking with Minimum Remaining Values (MRV), Degree Heuristic, Least Constraining Value (LCV), and Forward Checking (FC) to guarantee zero schedule conflicts.
- Developing a forward-chaining rule-based expert system with 28 production rules to infer personalized attraction suitability scores.
- Orchestrating these components under a 5-agent cooperative Multi-Agent System (PEAS) capable of real-time dynamic recovery when venues close unexpectedly.

### Motivation
Travel has become an indispensable facet of modern life, yet trip synthesis remains fragmented. While AI has made transformative strides in game playing (Chess, Go, Snake), its application to real-world multi-objective decision-making often relies on opaque, non-deterministic generative models. We were motivated to construct a system where every scheduling decision is mathematically justifiable, auditable, and provably optimal under defined traveler constraints. Developing TRAVORA bridges classical theoretical AI concepts taught in academic curricula with practical, real-world utility for Indian tourism destinations (Jaipur, Delhi, Goa, Mumbai, Varanasi, Agra, etc.).

### Significance
1. **Educational & Research Platform:** Serves as a comprehensive demonstration of core Artificial Intelligence curriculum topics—Uninformed Search, Informed $A^*$ Search, CSP Backtracking, Forward Chaining, and Multi-Agent Systems—in a single production-grade software stack.
2. **Deterministic Reliability:** Eliminates generative hallucinations; all attraction operating hours, ticket fees, coordinates, and transit matrices are validated against curated ground-truth knowledge bases.
3. **Dynamic Real-Time Resilience:** Provides instant itinerary recovery. If an attraction closes or weather deteriorates, the system re-solves local constraints without destabilizing the rest of the vacation.

### Challenges
- **State-Space Combinatorial Explosion:** A city with $N = 30$ candidate attractions across a $D = 4$ day trip produces a branching factor yielding over $30! / (30-8)! \approx 10^{11}$ possible permutations.
- **Formulating Admissible & Consistent Heuristics:** Step costs must strictly remain non-negative ($c \ge 0$). Any negative preference offset invalidates the triangle inequality, causing $A^*$ to lose admissibility.
- **Dynamic Multi-Constraint Interaction:** Balancing non-linear user preferences against rigid physical constraints (e.g., maximum daily walking kilometers, meal timings, transit buffers).
- **Separation of Academic Rigor and User Experience:** The system must execute rigorous academic algorithms in the backend while presenting a clean, jargon-free interface to the traveler.

### Novelty Proposed
TRAVORA introduces a novel **staged hybrid AI pipeline**:
1. **Stage 1 (Knowledge Filtering):** Forward-chaining expert rules filter unviable candidates and compute normalized preference scores $\text{pref\_norm} \in [0, 1]$.
2. **Stage 2 (Informed State-Space Search):** An admissible $A^*$ search engine sequences the optimal subset of geographic waypoints, minimizing entry fees, transit times, and preference penalties.
3. **Stage 3 (CSP Temporal Assignment):** A backtracking solver with MRV and Forward Checking assigns activities into specific daily slots, enforcing opening hours, meal pauses, and stamina limits.
4. **Stage 4 (Multi-Agent Monitoring):** A coordinator manages specialized agents (Destination, Preference, Planning, Optimization/Recovery) that monitor execution and perform local constraint repair if disruptions occur.

---

# 2. Literature Review

The development of intelligent travel recommendation systems draws upon several foundational areas in artificial intelligence and operations research:

1. **Vansteenwegen, P., Souffriau, W., & Van Oudheusden, D. (2011) [1]:**
   The authors established the foundational formulation of the *Orienteering Problem (OP)* and the *Team Orienteering Problem with Time Windows (TOPTW)* as applied to tourist trip design. They demonstrated that finding an optimal tourist itinerary is NP-hard. While metaheuristics (Iterated Local Search, Genetic Algorithms) provide fast approximations, they fail to provide theoretical guarantees of cost optimality. TRAVORA addresses this by bounding candidate attraction sets using knowledge-base filtering, enabling exact $A^*$ search and CSP backtracking to achieve provably optimal and conflict-free schedules.

2. **Gavalas, D., Konstantopoulos, C., Mastakas, K., & Pantziou, G. (2014) [2]:**
   This survey analyzed mobile tourist guides and heuristic recommendation algorithms. The researchers highlighted that tourist satisfaction degrades rapidly when systems recommend geographically irrational paths that cause excessive transit fatigue. They recommended combining geographic clustering with multi-attribute utility theory. In TRAVORA, inter-attraction transit matrices and stamina thresholds are directly integrated into the $A^*$ step cost and CSP fatigue constraints.

3. **Russell, S., & Norvig, P. (2020) [3]:**
   In *Artificial Intelligence: A Modern Approach (4th ed.)*, the authors detail the formal mathematical criteria for heuristic admissibility ($h(n) \le h^*(n)$) and consistency (monotonicity: $h(n) \le c(n, a, n') + h(n')$) in tree and graph search. They prove that consistent heuristics guarantee that $A^*$ expands the minimal number of nodes necessary to find an optimal path without reopening closed nodes. This theoretical framework directly guided the re-formulation of TRAVORA's heuristic function, eliminating negative preference offsets and ensuring strict adherence to the triangle inequality.

4. **Dechter, R. (2003) [4]:**
   Dechter’s work on *Constraint Processing* formalizes Constraint Satisfaction Problems (CSPs), variable ordering heuristics (Minimum Remaining Values - MRV, Degree Heuristic), value ordering heuristics (Least Constraining Value - LCV), and constraint propagation via Forward Checking and AC-3. TRAVORA implements these exact variable and value ordering heuristics to prune the exponential search tree during itinerary time-slot scheduling.

5. **Wooldridge, M. (2009) [5]:**
   Wooldridge’s *An Introduction to MultiAgent Systems* articulates the PEAS (Performance measure, Environment, Actuators, Sensors) framework and cooperative multi-agent architectures. In complex environments with changing operational statuses, monolithic solvers struggle. TRAVORA leverages Wooldridge’s multi-agent paradigm by assigning discrete responsibilities to five specialized agents coordinated under a supervisory agent.

---

# 3. Methodology

TRAVORA's architecture is organized into four interconnected functional layers:

```
+-----------------------------------------------------------------------------------+
|                            TRAVELER INTERFACE LAYER                                |
|  React 18 + TypeScript + Tailwind CSS | Instant Vector Diagram | Trip Review Wizard|
+-----------------------------------------------------------------------------------+
                                       |
                                       v REST APIs (FastAPI)
+-----------------------------------------------------------------------------------+
|                        PEAS MULTI-AGENT COORDINATOR                               |
|  - Destination Agent  - Preference Agent  - Planning Agent  - Optimization Agent  |
+-----------------------------------------------------------------------------------+
          |                                  |                           |
          v                                  v                           v
+-----------------------+        +-----------------------+   +----------------------+
| KNOWLEDGE BASE ENGINE |        |   STATE-SPACE SEARCH  |   |      CSP SOLVER      |
| 28 Production Rules   |        | A*, UCS, Greedy, BFS  |   | Backtracking + MRV   |
| Forward Chaining      | -----> | Admissible Heuristic  |-> | Forward Checking     |
| Normalized Preferences|        | Min Path Cost g(n)    |   | Zero-Conflict Slots  |
+-----------------------+        +-----------------------+   +----------------------+
```

1. **Traveler Interface:** Captures user inputs (destination, dates, budget, travel pacing/stamina, interests, dietary preferences) and visualizes the synthesized itinerary.
2. **Multi-Agent Coordination:** Orchestrates execution across knowledge inference, pathfinding, and temporal assignment.
3. **Inference & Search Pipeline:**
   - Evaluates traveler interests against candidate attractions using forward chaining.
   - Computes an optimal sequence of attractions using $A^*$ search over a state graph.
   - Assigns visits, meals, and transit buffers into conflict-free temporal slots using CSP backtracking.

---

# 4. Travel Planning as State-Space Search

### Problem & Description
The state-space search formulation selects and orders a subset of candidate attractions such that total itinerary cost is minimized while achieving the required number of visits across the trip duration.

### State-Space Representation
A search state $s$ is formally defined as a 5-tuple:
$$s = \langle \text{current\_loc}, \text{visited}, \text{accumulated\_cost}, \text{elapsed\_time}, \text{day\_index} \rangle$$

- **Current Location ($\text{current\_loc}$):** The attraction where the traveler is currently located (or the starting accommodation hub).
- **Visited Set ($\text{visited}$):** The set of unique attraction identifiers visited so far: $\text{visited} \subseteq \mathcal{A}$.
- **Accumulated Cost ($g(n)$):** The non-negative cumulative path cost incurred from the initial state to state $n$.
- **Elapsed Time ($\text{elapsed\_time}$):** Total operational time spent (visiting + transit) within the active day.
- **Day Index ($\text{day\_index}$):** The current day of the itinerary ($1 \le \text{day\_index} \le D$).

### State Formulations
- **Initial State ($s_0$):**
  $$s_0 = \langle \text{StartHotel}, \emptyset, 0.0, 0, 1 \rangle$$
- **Goal State ($s_g$):**
  Any state $s$ satisfying:
  $$|\text{visited}| \ge \text{target\_attractions} \quad (\text{where } \text{target\_attractions} = 2 \times D)$$
  subject to: $\text{total\_spent} \le \text{TotalBudget}$ and $\text{elapsed\_time} \le \text{MaxDailyHours}$.
- **Actions:**
  $$\text{Actions}(s) = \{ a \in \mathcal{A} \setminus \text{visited} \mid \text{ValidTransition}(s, a) \}$$
  A transition is valid if the entry fee does not breach the remaining budget and the visit duration plus transit time does not exceed the remaining hours of the day.

### Transition Model & Unified Step Cost
When the agent transitions from attraction $u$ to attraction $v$, the step cost $c(u, v)$ is calculated using a **strictly non-negative multi-objective cost function**:
$$c(u, v) = W_{\text{FEE}} \cdot \text{entry\_fee}(v) + W_{\text{TRANSIT}} \cdot \text{transit\_minutes}(u, v) + W_{\text{PREF}} \cdot (1 - \text{pref\_norm}(v))$$

Where:
- $\text{pref\_norm}(v) = \frac{\text{score}(v)}{\max_{a \in \mathcal{A}} \text{score}(a)} \in [0, 1]$.
- Weights are defined as positive global constants:
  $$W_{\text{FEE}} = 0.05, \quad W_{\text{TRANSIT}} = 0.5, \quad W_{\text{PREF}} = 20.0$$

**Justification of Weight Scales:**
- An entry fee of ₹1,000 contributes $0.05 \times 1000 = 50.0$ cost units.
- A 30-minute transit commute contributes $0.5 \times 30 = 15.0$ cost units.
- A poorly matched attraction ($\text{pref\_norm} = 0.1$) contributes $20.0 \times (1 - 0.1) = 18.0$ cost units, while an ideal match ($\text{pref\_norm} = 1.0$) contributes $0.0$.
All three objectives are thus calibrated to a balanced, comparable numerical scale ($10 \text{ to } 50$ units per step), and $c(u, v) \ge 0$ holds strictly under all circumstances.

### Admissible and Consistent Heuristic Formulation
To guide $A^*$ search without overestimating the remaining cost, the heuristic function $h(n)$ is defined as:
$$\text{needed} = \max(0, \, 2 \cdot D - |\text{visited}|)$$
$$h(n) = \sum_{i=1}^{\text{needed}} \min_{i} \Big( W_{\text{FEE}} \cdot \text{entry\_fee}(a) + W_{\text{PREF}} \cdot (1 - \text{pref\_norm}(a)) \Big) \quad \text{for } a \in \mathcal{A} \setminus \text{visited}$$
If $\text{needed} = 0$, $h(n) = 0$.

**Proof of Admissibility ($h(n) \le h^*(n)$):**
The true remaining cost $h^*(n)$ must visit at least $\text{needed}$ unvisited attractions and must incur both the attraction costs (fees and preference penalties) AND transit costs between them. Because:
1. $h(n)$ takes the optimistic sum of the absolute cheapest unvisited attractions without enforcing geographic constraints.
2. $h(n)$ completely omits the non-negative transit term ($W_{\text{TRANSIT}} \cdot \text{transit\_minutes} \ge 0$).
It follows that $h(n) \le h^*(n)$ for all states $n$. Hence, $h(n)$ is **strictly admissible**.

**Proof of Consistency ($h(n) \le c(n, n') + h(n')$):**
Moving from state $n$ to $n'$ by visiting attraction $v$:
$$c(n, n') = W_{\text{FEE}} \cdot \text{entry\_fee}(v) + W_{\text{TRANSIT}} \cdot \text{transit}(n, v) + W_{\text{PREF}} \cdot (1 - \text{pref\_norm}(v))$$
The remaining requirement decreases: $\text{needed}(n') = \text{needed}(n) - 1$.
Because $h(n)$ is the sum of the $\text{needed}(n)$ smallest attraction costs, removing attraction $v$ from the unvisited pool leaves $h(n')$ as the sum of the $\text{needed}(n) - 1$ smallest remaining costs. Thus:
$$h(n) - h(n') \le W_{\text{FEE}} \cdot \text{entry\_fee}(v) + W_{\text{PREF}} \cdot (1 - \text{pref\_norm}(v)) \le c(n, n')$$
Rearranging yields $h(n) \le c(n, n') + h(n')$, satisfying the triangle inequality. Hence, $h(n)$ is **consistent (monotonic)**.

### Search Algorithms Applied
- **Breadth-First Search (BFS):** Uninformed queue exploration; explores level-by-level based on hop count.
- **Depth-First Search (DFS):** Uninformed stack exploration; explores deep paths rapidly, often yielding highly suboptimal route costs.
- **Uniform Cost Search (UCS):** Priority queue ordered strictly by $g(n)$; guarantees cost-optimality but explores blindly in all directions.
- **Greedy Best-First Search:** Priority queue ordered strictly by $h(n)$; expands very few nodes but sacrifices path optimality.
- **$A^*$ Search:** Priority queue ordered by evaluation function $f(n) = g(n) + h(n)$; guarantees optimal path cost while maximally pruning the search frontier.

---

# 5. Travel Planning as Constraint Satisfaction Problem (CSP)

While state-space search identifies the optimal subset of attractions, a travel itinerary requires strict temporal scheduling. This is modeled as a Constraint Satisfaction Problem: $\mathcal{P} = \langle \mathcal{X}, \mathcal{D}, \mathcal{C} \rangle$.

### 1. Variables ($\mathcal{X}$)
For a trip of $D$ days with $S$ daily activity slots:
$$\mathcal{X} = \{ \text{Slot}_{d, s} \mid 1 \le d \le D, \, 1 \le s \le S \}$$
For example, for a 2-day trip with 3 slots per day (Morning, Afternoon, Evening):
$$\mathcal{X} = \{ \text{Slot}_{1,1}, \, \text{Slot}_{1,2}, \, \text{Slot}_{1,3}, \, \text{Slot}_{2,1}, \, \text{Slot}_{2,2}, \, \text{Slot}_{2,3} \}$$

### 2. Domains ($\mathcal{D}$)
The domain $\mathcal{D}_i$ for each variable consists of candidate attractions and dining venues in the selected city:
$$\mathcal{D}_i \subseteq \mathcal{A} \cup \mathcal{R} \cup \{ \text{RestBreak} \}$$

### 3. Constraints ($\mathcal{C}$)
Constraints enforce physical, operational, and user requirements:

#### Unary Constraints:
- **Operating Hours:**
  $$\forall \text{Slot}_{d, s} = a: \quad \text{StartTime}(\text{Slot}_{d, s}) \ge \text{OpenTime}(a) \quad \land \quad \text{EndTime}(\text{Slot}_{d, s}) \le \text{CloseTime}(a)$$
- **Dietary Restriction:**
  $$\forall \text{MealSlot}_{d} = r: \quad \text{DietaryOptions}(r) \supseteq \text{TravelerDietaryProfile}$$
- **Accessibility:**
  $$\text{RequiresWheelchair} \implies \text{HasRamps}(a) = \text{True}$$

#### Binary Constraints:
- **All-Different (No Duplicate Visits):**
  $$\forall i \ne j: \quad \text{Slot}_i \ne \text{Slot}_j \quad (\forall a \in \mathcal{A})$$
- **Temporal Transit Buffer:**
  $$\text{StartTime}(\text{Slot}_{d, s+1}) \ge \text{EndTime}(\text{Slot}_{d, s}) + \text{TransitTime}(\text{Slot}_{d, s}, \text{Slot}_{d, s+1})$$

#### Global Constraints:
- **Total Budget Upper Bound:**
  $$\sum_{d=1}^D \sum_{s=1}^S \text{Cost}(\text{Slot}_{d, s}) + \sum \text{TransitCost} \le \text{TotalTravelerBudget}$$
- **Daily Physical Stamina Threshold:**
  $$\forall d \in [1..D]: \quad \sum_{s=1}^S \text{WalkingKm}(\text{Slot}_{d, s}) \le \text{DailyStaminaLimit}(\text{PacingPreference})$$

### Solving Techniques
1. **Backtracking Search:** Depth-first assignment of values to variables with rollback on dead ends.
2. **Minimum Remaining Values (MRV):** Chooses the unassigned variable with the fewest legal values remaining in its domain ("fail-first" principle).
3. **Degree Heuristic:** Breaks ties among MRV variables by choosing the variable involved in the largest number of constraints with other unassigned variables.
4. **Least Constraining Value (LCV):** Prefers values that rule out the fewest choices for neighboring variables in the constraint graph.
5. **Forward Checking (FC):** Whenever variable $X$ is assigned value $v$, the solver prunes from the domains of all unassigned connected variables $Y$ any value inconsistent with $(X = v)$. If any domain becomes empty, the solver immediately backtracks.

---

# 6. CSP for a Particular Travel Instance

To illustrate concrete CSP resolution, consider a **2-Day Cultural Itinerary in Jaipur, India**:

### Traveler Profile
- **Budget:** ₹15,000
- **Interests:** History, Architecture, Local Cuisine
- **Dietary Requirement:** Pure Vegetarian
- **Pacing:** Moderate (Max 8 km walking per day)
- **Time Slots:** 2 activity slots + 1 dinner slot per day (6 total slots)

### Variables ($\mathcal{X}$)
- $X_1 = \text{Day1\_Morning}$ (09:30 – 13:00)
- $X_2 = \text{Day1\_Afternoon}$ (14:30 – 17:30)
- $X_3 = \text{Day1\_Dinner}$ (19:30 – 21:30)
- $X_4 = \text{Day2\_Morning}$ (09:30 – 13:00)
- $X_5 = \text{Day2\_Afternoon}$ (14:30 – 17:30)
- $X_6 = \text{Day2\_Dinner}$ (19:30 – 21:30)

### Initial Domains ($\mathcal{D}$)
- **Attractions:**
  - $A_1$: Amber Fort (Hours: 08:00–17:30, Fee: ₹500, Walking: 4.5 km, History/Arch)
  - $A_2$: City Palace (Hours: 09:30–17:00, Fee: ₹300, Walking: 2.5 km, History/Arch)
  - $A_3$: Hawa Mahal (Hours: 09:00–16:30, Fee: ₹200, Walking: 1.2 km, Architecture)
  - $A_4$: Jantar Mantar (Hours: 09:00–17:00, Fee: ₹200, Walking: 1.8 km, Science/History)
  - $A_5$: Nahargarh Fort (Hours: 10:00–17:30, Fee: ₹200, Walking: 3.5 km, View/History)
- **Dining:**
  - $R_1$: Chokhi Dhani (Traditional Rajasthani Pure Veg, Dinner only: 18:00–23:00, Cost: ₹900)
  - $R_2$: Laxmi Mishthan Bhandar (LMB) (Pure Veg Thali, Hours: 11:00–22:00, Cost: ₹500)
  - $R_3$: Handi Restaurant (Non-Veg specialist, Cost: ₹800) $\rightarrow$ *Pruned upfront by Forward Checking due to Pure Veg constraint.*

### Constraint Satisfaction Walkthrough

```
Step 1: Unary Constraint Pruning (Forward Checking)
        - Handi ($R_3$) pruned from $X_3$ and $X_6$ domains (Violates Pure Veg requirement).
        - Chokhi Dhani ($R_1$) pruned from Morning/Afternoon slots (Only open 18:00-23:00).

Step 2: Variable Selection by MRV
        - $X_3$ and $X_6$ (Dinner slots) have domain size 2 ($R_1, R_2$).
        - $X_1, X_2, X_4, X_5$ have domain size 5 ($A_1$ to $A_5$).
        - MRV selects $X_3$. LCV assigns $X_3 = R_1$ (Chokhi Dhani).

Step 3: Attraction Assignment with Geographic Consistency
        - Assign $X_1 = A_1$ (Amber Fort).
        - Forward Checking removes $A_1$ from domains of $X_2, X_4, X_5$ (All-Different constraint).
        - Binary transit constraint: Transit from $A_1$ to city center is 25 minutes.
        - Next slot $X_2$ chooses $A_2$ (City Palace, open until 17:00).
        - Stamina check for Day 1: Walking = 4.5 km ($A_1$) + 2.5 km ($A_2$) = 7.0 km $\le 8.0$ km limit. Constraint Satisfied.

Step 4: Day 2 Assignment
        - Assign $X_4 = A_3$ (Hawa Mahal) and $X_5 = A_4$ (Jantar Mantar) due to immediate geographic proximity (adjacent across the street, 3-minute walk).
        - Assign $X_6 = R_2$ (Laxmi Mishthan Bhandar).
        - Stamina check for Day 2: Walking = 1.2 km + 1.8 km = 3.0 km $\le 8.0$ km limit.
        - Budget check: Total fees (₹500 + ₹300 + ₹200 + ₹200) + Meals (₹900 + ₹500) + Transit (₹1,200) = ₹3,800 $\le$ ₹15,000 budget.

Result: Feasible, zero-conflict assignment discovered with 0 backtracks.
```

---

# 7. Implementation

TRAVORA's backend is implemented in Python 3.11 with FastAPI, and its frontend is constructed using React 18, TypeScript, and Tailwind CSS. The AI subsystem comprises four core modules:

## a. Rule-Based Expert System (Knowledge Base & Forward Chaining)
The expert system evaluates traveler profile facts against a curated knowledge base of 28 production rules using forward chaining.

- **Environment:** The repository of candidate attractions, seasonal operating hours, weather conditions, and regional festivals.
- **Perception:** User survey answers including budget tier, accessibility flags, preferred activities, and culinary restrictions.
- **Decision Making:** Production rules of the form $\text{IF } \langle\text{conditions}\rangle \text{ THEN } \langle\text{actions}\rangle$ fire iteratively until no further inferences can be made.
- **Actuation:** Produces adjusted attraction suitability weights and strictly pruned candidate lists.

```python
# Representative Forward Chaining Production Rules in TRAVORA
RULE_KB = [
    {
        "id": "RULE_01_HERITAGE_PREF",
        "condition": lambda u, a: "history" in u.interests and "heritage" in a.tags,
        "action": lambda u, a: a.add_score_boost(35, "Strong match for historical interest")
    },
    {
        "id": "RULE_07_ACCESSIBILITY_HARD_PRUNE",
        "condition": lambda u, a: u.requires_wheelchair and not a.wheelchair_accessible,
        "action": lambda u, a: a.mark_ineligible("Lacks verified step-free wheelchair access")
    },
    {
        "id": "RULE_14_SUMMER_HEAT_MITIGATION",
        "condition": lambda u, a: u.travel_month in [5, 6] and a.is_outdoor and a.duration_hours > 2.5,
        "action": lambda u, a: a.restrict_time_window("08:00-11:00", "Avoid peak afternoon summer heat")
    },
    {
        "id": "RULE_22_BUDGET_TIERING",
        "condition": lambda u, a: u.budget_tier == "budget" and a.entry_fee > 600,
        "action": lambda u, a: a.add_penalty(25, "High ticket price for budget-tier trip")
    }
]
```

## b. Breadth-First Search (BFS) & Uniform Cost Search (UCS)
- **BFS:** Explores states strictly level by level using a FIFO queue (`collections.deque`). It treats every transition as having uniform cost, effectively minimizing the number of hops. While it reliably finds a valid goal state, it completely ignores entry fees and transit times, leading to suboptimal monetary and transit costs.
- **UCS (Dijkstra):** Implemented using a min-heap priority queue ordered by accumulated path cost $g(n)$. At each step, UCS pops the node with the lowest cumulative cost. UCS is guaranteed to return the optimal cost path, but explores uniformly in all directions, expanding a high number of nodes.

## c. Informed $A^*$ Search Algorithm
$A^*$ uses a priority queue ordered by $f(n) = g(n) + h(n)$. The open set is managed using Python’s `heapq` module.

```python
class AStarPlanner:
    def __init__(self, attractions: list, transit_matrix: dict, weights: tuple = (0.05, 0.5, 20.0)):
        self.attractions = attractions
        self.transit_matrix = transit_matrix
        self.w_fee, self.w_transit, self.w_pref = weights
        self.max_pref = max((a.preference_score for a in attractions), default=1.0) or 1.0

    def compute_step_cost(self, from_loc: str, to_attr) -> float:
        pref_norm = to_attr.preference_score / self.max_pref
        transit_min = self.transit_matrix.get((from_loc, to_attr.id), 20.0)
        
        # Strictly non-negative step cost formulation
        step_cost = (
            self.w_fee * to_attr.entry_fee +
            self.w_transit * transit_min +
            self.w_pref * (1.0 - pref_norm)
        )
        return max(0.0, step_cost)

    def heuristic(self, visited_ids: set, target_count: int) -> float:
        needed = max(0, target_count - len(visited_ids))
        if needed == 0:
            return 0.0

        unvisited = [a for a in self.attractions if a.id not in visited_ids]
        if not unvisited:
            return 0.0

        # Optimistic lower bound: smallest (fee + preference) costs; zero transit
        attr_costs = []
        for a in unvisited:
            pref_norm = a.preference_score / self.max_pref
            cost = self.w_fee * a.entry_fee + self.w_pref * (1.0 - pref_norm)
            attr_costs.append(cost)

        attr_costs.sort()
        return sum(attr_costs[:needed])

    def search(self, start_hub: str, days: int):
        target_visits = days * 2
        # Priority queue stores tuples: (f_score, tie_breaker, state)
        # Guarantees optimal path when heuristic is admissible and consistent
        ...
```

## d. Multi-Agent Architecture (PEAS Framework)
TRAVORA deploys five specialized autonomous agents operating cooperatively:

| Agent Name | Performance Measure (P) | Environment (E) | Actuators (A) | Sensors (S) |
| :--- | :--- | :--- | :--- | :--- |
| **Coordinator Agent** | End-to-end plan feasibility, zero constraint violations | Global multi-agent execution pipeline | Dispatches sub-tasks, commits final itinerary to database | User configuration payload, status codes from subordinate agents |
| **Destination Agent** | Geographic clustering density, travel radius validity | City attraction database, geocoordinates | Filters regional destination candidates | City knowledge graph, GPS distance matrices |
| **Preference Agent** | Traveler preference alignment ($\text{pref\_norm} \to 1.0$) | User survey profiles, rule knowledge base | Computes suitability scores, prunes dietary/accessibility mismatches | Profile constraints, interest tags |
| **Planning Agent** | Minimization of path cost $g(n)$, minimal node expansion | $A^*$ State-space search graph | Sequences daily attraction order, constructs initial itinerary | Priority queue state, heuristic evaluations |
| **Optimization & Recovery Agent** | Recovery time $< 100\text{ ms}$, localized repair without global schedule shifts | Real-time venue operating status, disruption events | Replaces closed venues using local CSP repair | Venue closure signals, traveler change requests |

---

# 8. Results & Performance Evaluation

### Empirical Benchmark Setup
The state-space search algorithms were benchmarked across three realistic scenarios representing different trip durations, budgets, and candidate attraction densities:
- **Scenario 1:** Jaipur (2 Days, 4 target visits, 10 candidate attractions, Budget ₹15,000)
- **Scenario 2:** Delhi (2 Days, 4 target visits, 8 candidate attractions, Budget ₹20,000)
- **Scenario 3:** Goa (3 Days, 6 target visits, 8 candidate attractions, Budget ₹25,000)

All benchmarks were executed on an AMD Ryzen 7 / Intel Core i7 architecture running Python 3.11 with FastAPI backend services.

### Empirical Benchmark Results

#### Scenario 1: Jaipur (2 Days, Target: 4 Attractions)
| Algorithm | Nodes Expanded | Runtime (ms) | Final Path Cost | Goal Found | Optimality Ratio vs UCS |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **$A^*$ Search** | **141** | **15.96 ms** | **43.82** | **Yes** | **1.00x (Optimal)** |
| **Uniform Cost Search (UCS)** | 542 | 58.15 ms | 43.82 | Yes | 1.00x (Optimal) |
| **Greedy Best-First Search** | 5 | 0.58 ms | 81.65 | Yes | 1.86x (Suboptimal) |
| **Breadth-First Search (BFS)** | 959 | 87.61 ms | 81.65 | Yes | 1.86x (Suboptimal) |
| **Depth-First Search (DFS)** | 8 | 3.82 ms | 54.82 | Yes | 1.25x (Suboptimal) |

#### Scenario 2: Delhi (2 Days, Target: 4 Attractions)
| Algorithm | Nodes Expanded | Runtime (ms) | Final Path Cost | Goal Found | Optimality Ratio vs UCS |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **$A^*$ Search** | **96** | **9.30 ms** | **37.47** | **Yes** | **1.00x (Optimal)** |
| **Uniform Cost Search (UCS)** | 164 | 13.06 ms | 37.47 | Yes | 1.00x (Optimal) |
| **Greedy Best-First Search** | 5 | 0.28 ms | 98.35 | Yes | 2.62x (Suboptimal) |
| **Breadth-First Search (BFS)** | 561 | 35.77 ms | 98.35 | Yes | 2.62x (Suboptimal) |
| **Depth-First Search (DFS)** | 6 | 4.64 ms | 56.32 | Yes | 1.50x (Suboptimal) |

#### Scenario 3: Goa (3 Days, Target: 6 Attractions)
| Algorithm | Nodes Expanded | Runtime (ms) | Final Path Cost | Goal Found | Optimality Ratio vs UCS |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **$A^*$ Search** | **1,462** | **123.09 ms** | **97.22** | **Yes** | **1.00x (Optimal)** |
| **Uniform Cost Search (UCS)** | 1,802 | 110.12 ms | 97.22 | Yes | 1.00x (Optimal) |
| **Greedy Best-First Search** | 7 | 0.47 ms | 267.96 | Yes | 2.76x (Suboptimal) |
| **Breadth-First Search (BFS)** | 2,500 (cutoff) | 192.18 ms | 176.98 | Fallback | 1.82x (Suboptimal) |
| **Depth-First Search (DFS)** | 461 | 13.77 ms | 217.00 | Yes | 2.23x (Suboptimal) |

### Heuristic Verification via Pytest Suite
To rigorously validate algorithm correctness, comprehensive automated unit tests were implemented in `tests/test_ai_algorithms.py`:
1. **Non-Negative Step Costs:** Asserted that for all transitions $(u, v)$, $c(u, v) \ge 0$.
2. **Admissibility Verification:** On small brute-force instances, verified $h(n) \le h^*(n)$ for 100% of tested search nodes.
3. **Consistency Verification:** Asserted $h(n) \le c(n, n') + h(n')$ across 1,000 randomized state transitions.
4. **Cost Optimality Match:** Asserted that $A^*$ path cost equals UCS path cost identically across all test cases.
5. **Expansion Bound:** Asserted that $\text{NodesExpanded}(A^*) \le \text{NodesExpanded}(\text{UCS})$.

All 12 test suites pass with 100% success rate.

---

# 9. Discussion

### Comparative Analysis of Algorithms
1. **$A^*$ vs Uniform Cost Search:**
   Across all three benchmark cities, $A^*$ and UCS achieved identical optimal path costs (43.82 in Jaipur, 37.47 in Delhi, 97.22 in Goa). However, $A^*$ expanded dramatically fewer nodes:
   - In Jaipur, $A^*$ required only 141 node expansions versus 542 for UCS (**74.0% reduction in search frontier**).
   - In Delhi, $A^*$ required 96 node expansions versus 164 for UCS (**41.5% reduction**).
   This confirms that an admissible and consistent heuristic successfully directs the search toward the goal without exploring irrelevant portions of the state graph.

2. **Greedy Best-First Search:**
   Greedy search expanded the fewest nodes (5–7 nodes) and executed in sub-millisecond times ($< 0.6\text{ ms}$). However, its greedy nature resulted in severely suboptimal path costs (up to $2.76\times$ higher cost than $A^*$ in Goa). Because Greedy ignores accumulated transit and fee expenditures $g(n)$, it repeatedly chooses high-scoring attractions that require massive, impractical transit cross-travel.

3. **BFS and DFS Blind Searches:**
   BFS expanded up to 2,500 nodes and frequently hit expansion limits because the branching factor grows combinatorially with the number of candidate attractions. DFS explored quickly but yielded unpredictable path costs ($1.25\times$ to $2.23\times$ suboptimal).

### Resolution of the Negative Cost Flaw
In the initial development phase, the path cost was formulated as:
$$g(n) = \sum \Big( \text{entry\_fee} + \text{transit} - 100 \cdot \text{preference\_score} \Big)$$
This legacy formulation contained a fundamental mathematical flaw: large positive preference scores caused step costs to become negative ($c(u, v) < 0$). In the presence of negative edge weights:
- Standard Dijkstra and $A^*$ algorithms fail because paths can cycle to accumulate arbitrarily low costs.
- The heuristic function $h(n)$ was based purely on transit/fees and ignored preferences, resulting in $h(n)$ overestimating remaining costs ($h(n) > h^*(n)$), which completely destroyed $A^*$ admissibility.

By re-formulating the preference objective as an opportunity penalty $W_{\text{PREF}} \cdot (1 - \text{pref\_norm})$ with $\text{pref\_norm} \in [0, 1]$ and strictly non-negative weights, every step cost is guaranteed non-negative ($c \ge 0$). Defining $h(n)$ as the optimistic sum of unvisited attraction costs guaranteed both **admissibility** and **monotonic consistency**.

### Traveler-Centric UI Abstraction
A key architectural achievement of TRAVORA is the complete decoupling of academic AI execution from the traveler interface. While the backend executes rigorous $A^*$, CSP backtracking, and forward chaining, the frontend presents intuitive travel concepts:
- $A^*$ pathfinding is abstracted as **Smart Geographic Sequencing**.
- CSP backtracking with MRV is presented as **Conflict-Free Daily Schedules**.
- Multi-agent dynamic recovery is surfaced as a seamless **"Replace this activity"** feature.

---

# 10. Conclusion

In this project, we successfully developed and evaluated **TRAVORA**, an intelligent, constraint-aware travel planning application. By synthesizing classical artificial intelligence methodologies—State-Space Search ($A^*$, UCS, BFS, DFS), Constraint Satisfaction Problems (Backtracking, MRV, LCV, Forward Checking), Rule-Based Forward Chaining, and PEAS Multi-Agent Systems—the system resolves the complex combinatorial challenge of multi-day itinerary generation.

Empirical evaluation across three benchmark scenarios (Jaipur, Delhi, Goa) demonstrates that our admissible and consistent $A^*$ formulation achieves provably optimal path costs with up to a 74% reduction in node expansions compared to Uniform Cost Search. The CSP solver guarantees zero temporal overlaps, strict adherence to budget and daily physical stamina thresholds, and 100% compliance with dietary requirements. Furthermore, the multi-agent cooperative architecture enables instant, localized plan recovery when venues close, ensuring resilient, real-world utility.

TRAVORA establishes that deterministic, constraint-based artificial intelligence techniques provide a robust, auditable, and hallucination-free foundation for automated itinerary synthesis.

---

# 11. References

1. P. Vansteenwegen, W. Souffriau, and D. Van Oudheusden, "The orienteering problem: A survey," *European Journal of Operational Research*, vol. 209, no. 1, pp. 1–10, Feb. 2011, doi: 10.1016/j.ejor.2010.03.045.
2. D. Gavalas, C. Konstantopoulos, K. Mastakas, and G. Pantziou, "A survey on algorithmic approaches for solving tourist trip design problems," *Journal of Heuristics*, vol. 20, no. 3, pp. 291–328, Jun. 2014, doi: 10.1007/s10732-014-9242-5.
3. S. Russell and P. Norvig, *Artificial Intelligence: A Modern Approach*, 4th ed. Hoboken, NJ, USA: Pearson, 2020.
4. R. Dechter, *Constraint Processing*. San Francisco, CA, USA: Morgan Kaufmann Publishers, 2003.
5. M. Wooldridge, *An Introduction to MultiAgent Systems*, 2nd ed. Chichester, UK: John Wiley & Sons, 2009.
6. A. Lim, H. Rodrigues, F. T. Ramos, and M. E. R. M. P. de Souza, "Personalized tour recommendation with route design," in *Proc. 24th ACM Int. Conf. Information and Knowledge Management (CIKM)*, Melbourne, Australia, 2015, pp. 1827–1830.
7. S. S. Mim, M. N. Islam, and D. Logofatu, "Examining Various Search Algorithms in AI With Appropriate Literature and Their Performances Against a Human Agent in the Snake Game," in *Proc. 2023 IEEE Global Engineering Education Conf. (EDUCON)*, Kuwait, 2023, pp. 1–10.
8. P. E. Hart, N. J. Nilsson, and B. Raphael, "A formal basis for the heuristic determination of minimum cost paths," *IEEE Transactions on Systems Science and Cybernetics*, vol. 4, no. 2, pp. 100–107, Jul. 1968.
