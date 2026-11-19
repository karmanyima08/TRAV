# TRAVORA — AI Report Reference Notes & Catalog of Technical Text

> **Document Purpose:** This document catalogs all academic and technical terminology removed from the user-facing traveler frontend of TRAVORA. It preserves the exact original wording, page locations, and academic context so team members can copy and reference them directly in project reports, research papers, presentations, or project vivas for CSE3705.

---

## 1. Page Title & Meta Tags (`frontend/index.html`)

* **Location:** `<title>` tag (Line 7)
* **Original Wording:**
  ```html
  <title>TRAVORA — Intelligent Travel Planning | Constraint-Based AI</title>
  ```
* **New Traveler-Facing Wording:**
  ```html
  <title>TRAVORA — Intelligent Travel Planning</title>
  ```
* **Academic Report Context:** Course Title mapping — *Travel & Trip Planner: A Constraint-Based and Adaptive Travel Planning System for Effective Trip Generation*.

---

## 2. Navigation Bar (`frontend/src/components/Navbar.tsx`)

* **Location:** Navigation items & Brand tagline (Lines 12 & 31)
* **Original Wording:**
  * Nav link: `AI Search & CSP` (pointing to `/ai-explorer`, icon: `Sparkles`)
  * Brand tagline: `AI Travel Engine`
* **New Traveler-Facing Wording:**
  * Nav link removed completely from navigation.
  * Brand tagline: `Smart Travel Planner`.
* **Academic Report Context:** The `/ai-explorer` interactive visualization tool remains fully functional in the codebase at `/ai-explorer` for grading demonstration and algorithm stepping.

---

## 3. Global Footer (`frontend/src/components/Footer.tsx`)

* **Location:** Brand description, academic chips, course grid, and engine telemetry card
* **Original Wording Removed:**
  * Brand description chip:
    ```
    "An intelligent, constraint-based and adaptive travel planning system. Powered by State Space Search, CSP Backtracking with MRV/LCV, and Multi-Agent expert reasoning."
    ```
  * Course chip:
    ```
    "CSE3705 AI Course Project"
    ```
  * Column 1 — AI Handout Topics:
    * `Topic 2: State Space Search (A*, BFS, DFS, UCS)`
    * `Topic 3: CSP Solver (MRV, Degree, LCV, FC)`
    * `Topic 4: Forward Chaining Knowledge Base`
    * `Topic 5: PEAS Intelligent Multi-Agents`
  * Column 2 — Project Specification:
    * `Course: CSE3705 Artificial Intelligence`
    * `Official Title: Travel Trip Planner: A Constraint-Based and Adaptive Travel Planning System`
    * `Group: AI Group 4`
    * `Members: Gaurang Mudgil, Hardik Sardana, Ishant Rai, Karma Nyima, Himanshu Yadav`
  * Column 3 — Engine Status:
    * `Deterministic AI Active v1.0.0`
    * `A* Heuristic and CSP Forward Checking verified operational.`
  * Bottom links:
    * `Built for University AI Research & Demonstration.`
    * `Algorithmic Transparency`
* **New Traveler-Facing Wording:**
  * Clean, minimal footer featuring the TRAVORA logo, one-line traveler tagline (*"Personalized, constraint-aware travel planning for unforgettable journeys"*), About, Privacy, and copyright.
* **Academic Report Context:** Useful for Report Section 1 (Executive Summary) and Section 5 (PEAS Multi-Agent architecture).

---

## 4. Trip Planning Wizard (`frontend/src/pages/TripWizard.tsx`)

### Step 1 (Destination)
* **Original:** `"Select from verified knowledge-base seeded cities."`
* **New:** `"Select from our popular Indian travel destinations."`

### Step 3 (Budget Allocation)
* **Original:** `"Used by CSP solver as a hard upper bound across activities, dining, and transit."`
* **New:** `"Sets the overall spending limit across activities, dining, and transit."`

### Step 4 (Activity Interests)
* **Original:** `"Forward chaining rules match interests to boost attraction suitability scores."`
* **New:** `"We'll prioritize attractions and experiences that match what you enjoy most."`

### Step 5 (Dining & Dietary Restrictions)
* **Original:** `"Strict CSP rules exclude non-compliant restaurants (e.g. Jain, Pure Veg, Halal)."`
* **New:** `"We'll only suggest dining options that fit your food preferences and diet."`

### Step 6 (Physical Comfort & Accessibility)
* **Original:** `"CSP limits consecutive walking tours based on daily physical fatigue thresholds."`
* **New:** `"We'll pace each day's walking to match your energy level and comfort."`
* **Original (Checkbox):** `"Prunes all attractions lacking verified ramps or step-free access."`
* **New:** `"Only selects attractions with verified ramps or step-free access."`

### Step 7 (Transit Preference)
* **Original:** `"Used to compute transit travel times and step costs in state-space search."`
* **New:** `"Used to calculate travel times and routes between activities."`

### Step 8 (Review Step)
* **Original Step Header:** `"Review & AI Algorithm Selection"` with progress step labeled `"AI Engine Formulation"`.
* **Original Subtitle:** `"Choose the State Space Search algorithm to execute on your problem formulation."`
* **Original Algorithm Picker:**
  * Section title: `"Primary Search Algorithm (Course Topic 2)"`
  * Card 1: `A* Search (Recommended)` — `Optimal pathfinding with admissible heuristic f(n) = g(n) + h(n)` — Badge: `Admissible & Optimal`
  * Card 2: `Greedy Best-First Search` — `Prioritizes immediate minimum heuristic h(n) estimate` — Badge: `Heuristic Only`
  * Card 3: `Uniform Cost Search (Dijkstra)` — `Expands strictly lowest accumulated path cost g(n)` — Badge: `Optimal Uninformed`
  * Card 4: `Breadth-First Search (BFS)` — `Level-by-level queue exploration for shortest hop count` — Badge: `Unweighted`
* **Original Submit Button:** `"Generate AI Itinerary"`
* **New Traveler-Facing Wording:**
  * Step renamed to: `"Review your trip"`.
  * Clean summary card showing Destination, Duration, Budget, Stamina, and Interests.
  * Algorithm selection cards completely removed (A* search with admissible heuristic runs automatically in background).
  * Submit Button: `"Generate my itinerary"`.

---

## 5. Dashboard (`frontend/src/pages/Dashboard.tsx`)

* **Hero Banner Chip:**
  * Original: `AI Travel Workspace`
  * New: `Travel Workspace`
* **Hero Subtitle:**
  * Original: `"Review your saved itineraries, audit algorithmic search states, or synthesize a new trip."`
  * New: `"Review your saved itineraries, plan new adventures, or customize your group travel plans."`
* **KPI Metrics Grid:**
  * Original Card 1: `Saved Trips` with subtitle `Deterministic verified` $\rightarrow$ Replaced subtitle with `Ready to travel`.
  * Original Card 3: `AI Algorithms Active` / `5 Solvers` (`A*, CSP, FC, Forward Chaining`) $\rightarrow$ Replaced with `Cities Explored` / `{count} Destinations` (`Unique places`).
  * Original Card 4: `Autonomous Agents` / `5 Agents` (`PEAS Synchronized`) $\rightarrow$ Replaced with `Days Planned` / `{count} Days` (`Full itineraries`).
* **Quick Action Cards:**
  * Removed `AI Algorithm Visualizer` card (`Explore search tree & CSP steps`).
  * Updated `Group Optimizer` subtitle from `Pareto-optimal group balancer` to `Balance preferences for the whole group`.
* **Trip Cards:**
  * Removed `ID: trip_xxx` hash display.
* **Empty State:**
  * Original: `"Launch the trip wizard to experience constraint-satisfaction travel synthesis in seconds."`
  * New: `"Launch the trip wizard to create your first customized travel itinerary in seconds."`

---

## 6. Group Trip Planner (`frontend/src/pages/GroupOptimizer.tsx`)

* **Page Badges Removed:**
  * `Consensus Engine`
  * `Course Objective #3`
* **Page Title:**
  * Original: `Group Travel Preference Optimizer`
  * New: `Group Trip Planner`
* **Page Subtitle:**
  * Original: `"Aggregates conflicting traveler interests through weighted Pareto balancing without allowing one person's taste to dominate."`
  * New: `"Add everyone's interests and budget, and we'll build a trip that works for the whole group."`
* **Action Button:**
  * Original: `"Synthesize Balanced Itinerary"`
  * New: `"Build group itinerary"`
* **Results Header:**
  * Original: `"Synthesized Consensus Itinerary (X Days)"`
  * New: `"Group Itinerary (X Days)"`

---

## 7. Itinerary View (`frontend/src/pages/Itinerary.tsx`)

* **Loading Screen:**
  * Original Title: `"Synthesizing Constraint-Feasible Itinerary..."`
  * Original Subtitle: `"Running A* Search, CSP Backtracking with MRV, and Forward Checking."`
  * New Title: `"Generating Your Personalized Itinerary..."`
  * New Subtitle: `"Finding the best attractions, timing, and routes for your trip."`
* **Header Badges:**
  * Removed: `Deterministic Plan Verified` and `Algorithm: A*`.
  * New: Single clean badge `Personalized Plan`.
* **Recovery Notification:**
  * Original: `"Dynamic Recovery Applied: ..."`
  * New: `"Activity Updated: ..."`
* **Activity Card Explanation Callout:**
  * Original Heading: `"Why was this scheduled?"` followed by raw rule explanations.
  * New Heading: `"Why we picked this:"` with sanitized natural language explaining how the sight fits traveler interests, budget, and daily pacing.
* **Activity Card Replace Button:**
  * Original Title: `"Simulate Venue Closure / Dynamic Recovery"`
  * New Title: `"Replace this activity"`
* **Quick Actions:**
  * Removed link to `/ai-explorer` (`Inspect Search Tree & CSP Steps`).
* **Telemetry & Agent Panels (Removed from view):**
  * Removed `Search Engine Telemetry` card displaying: `Algorithm: A*`, `States Explored`, `Path Cost g(n)`, `Heuristic h(n)`.
  * Removed `<AgentActivityPanel>` component from itinerary render (multi-agent PEAS audit logs and stream).
* **Recovery Modal:**
  * Original Header: `"Dynamic Itinerary Recovery"` $\rightarrow$ New: `"Replace Activity"`.
  * Original Body: `"The Optimization and Recovery Agent will replace this venue using local CSP constraints without altering the rest of your trip."` $\rightarrow$ New: `"We'll find the best available alternative nearby that fits your budget and timing without altering the rest of your trip."`
  * Original Submit Button: `"Execute Recovery"` $\rightarrow$ New: `"Find Replacement"`.

---

## 8. Budget What-If Simulator (`frontend/src/pages/BudgetSimulator.tsx`)

* **Page Badges Removed:**
  * `Dynamic What-If Engine`
  * `Course Objective #5`
* **Subtitle Refinement:**
  * Original: `"Observe how adjusting travel budget reallocates attraction tiers, hotel standards, and meal selections in real time."`
  * New: `"See how adjusting your travel budget updates attraction tiers, hotel standards, and meal selections in real time."`

---

## 9. Landing Page (`frontend/src/pages/Landing.tsx`)

* **Hero Pill:**
  * Original: `"University AI Research Project — CSE3705 Implementation"`
  * New: `"Smart Travel Planning"`
* **Hero Subtitle:**
  * Original: `"Replace dozens of scattered browser tabs with deterministic Artificial Intelligence. Powered by real A* Search, CSP Backtracking with MRV/LCV, and a cooperative Multi-Agent Expert System."`
  * New: `"Replace dozens of scattered browser tabs with effortless, intelligent trip planning. Designed around your real budget, daily rhythm, and unique travel style."`
* **Hero CTAs:**
  * Removed `"Launch AI Visualizer"` secondary CTA button.
* **Floating Metrics Grid:**
  * Original: `5 Algorithms (BFS, DFS, UCS, Greedy, A*)`, `12 Constraints (CSP Backtracking & MRV)`, `28 Rules (Forward Chaining KB)`, `5 Agents (PEAS Architecture)`
  * New: `10 Cities (Curated Indian Destinations)`, `Smart Routes (Zero Schedule Overlaps)`, `Diet & Budget (Pure Veg, Jain & Halal)`, `Dynamic Backup (Instant Spot Replacements)`
* **"How It Works" Section:**
  * Step 2: Renamed from `"A* State Space Search"` to `"Route Optimization"` (*"Discovers the most convenient visit order minimizing commute time and travel fatigue"*).
  * Step 3: Renamed from `"CSP Constraint Solving"` to `"Schedule Validation"` (*"Verifies operating hours, transit buffers, and meal breaks so there are zero conflicts"*).
  * Step 4: Renamed from `"Adaptive Execution"` to `"Adaptive Itinerary"`.
* **Course AI Topics Grid:**
  * Section title changed from `"Integrated AI Course Topics (CSE3705)"` to `"Built for Real-World Travel"`.
  * Badge changed from `"Academic Handout Implementation"` to `"Key Features"`.
  * Replaced technical card headers (`TOPIC 2 A* Search`, `TOPIC 3 CSP Solver`, `TOPIC 4 Rule-Based`, `TOPIC 5 Multi-Agent`, `PEAS Framework`) with travel-centric features (`Geographic Route Sequencing`, `Opening Hours & Time Windows`, `Interest & Diet Customization`, `Interactive Budget Simulator`, `Instant Spot Replacements`, `Group Trip Planner`).
* **Testimonials:**
  * Chip changed from `"Sample Testimonials / Academic Evaluation Data"` to `"Traveler Stories"`.
  * Title changed from `"Validated by Student Travelers & AI Evaluators"` to `"Loved by Travelers Across India"`.
  * Quotes sanitized of A*, CSP, Forward Checking, and Dynamic Recovery Agent jargon into clear traveler testimonials.
* **Bottom Banner:**
  * Subtitle changed from `"Experience algorithmic constraint-satisfaction travel generation in seconds. Zero generic hallucinations."` to `"Experience effortless, constraint-aware travel planning in seconds."`

---

## 10. Summary Table for Report Presentation

| AI Topic in Syllabus | Academic Representation | User-Facing Product Translation |
| :--- | :--- | :--- |
| **Topic 2: State Space Search** | $A^*$ Search with admissible heuristic $h(n)$ ($f(n) = g(n) + h(n)$), UCS, Greedy | **Route Optimizer & Smart Sequencing** |
| **Topic 3: CSP** | Backtracking Search with MRV, Degree Heuristic, LCV, and Forward Checking | **Conflict-Free Schedule & Time Windows** |
| **Topic 4: Knowledge Representation** | 28 Production Rules & Forward Chaining Inference Engine | **Interest, Dietary & Accessibility Customization** |
| **Topic 5: Multi-Agent Systems** | 5 Autonomous Cooperative Agents under formal PEAS Specifications | **Coordinated Travel Pipeline & Instant Spot Replacements** |
