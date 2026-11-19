export interface User {
  id: string;
  name: string;
  email: string;
  preferences?: Record<string, any>;
  saved_trips_count?: number;
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  description: string;
  climate: string;
  best_season: string;
  avg_daily_cost: {
    budget: number;
    mid: number;
    luxury: number;
  };
}

export interface Attraction {
  id: string;
  destination_id: string;
  name: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
  entry_fee: number;
  avg_duration_hours: number;
  opening_time: number;
  closing_time: number;
  closed_days: number[];
  suitable_weather: string[];
  tags: string[];
  accessibility: boolean;
  family_friendly: boolean;
  indoor: boolean;
  popularity_score: number;
  budget_category: string;
  ai_score?: number;
  ai_explanations?: string[];
}

export interface Activity {
  slot_label: string;
  time_window: string;
  attraction_id: string;
  name: string;
  category: string;
  description: string;
  lat?: number;
  lng?: number;
  entry_fee: number;
  duration_hours: number;
  transit_from_previous_min: number;
  distance_from_previous_km: number;
  ai_score: number;
  ai_explanation: string;
}

export interface Meal {
  name: string;
  cuisine: string;
  avg_cost: number;
  dietary: string[];
}

export interface DayPlan {
  day_number: number;
  activities: Activity[];
  meals: {
    lunch?: Meal;
    dinner?: Meal;
  };
}

export interface Itinerary {
  id?: string;
  trip_id?: string;
  destination: Destination;
  trip_params: Record<string, any>;
  days: DayPlan[];
  total_estimated_expenditure: number;
  cost_breakdown: {
    attractions: number;
    food: number;
    transport: number;
    accommodation: number;
  };
  budget_utilization_percentage: number;
  search_metadata?: any;
  csp_metadata?: any;
  agent_logs?: AgentLog[];
  peas_framework?: Record<string, Record<string, string>>;
  pipeline_time_ms: number;
}

export interface AgentLog {
  timestamp: number;
  time_str: string;
  agent: string;
  level: string;
  message: string;
  details?: any;
}

export interface SearchNode {
  node_id: number;
  parent_id?: number | null;
  depth: number;
  g_cost: number;
  h_cost: number;
  f_cost: number;
  is_goal: boolean;
  state_summary: string;
  location?: string;
  day?: number;
  time_str?: string;
  remaining_budget?: number;
  visited_count?: number;
}

export interface SearchResult {
  algorithm: string;
  solution_found: boolean;
  solution_path: any[];
  final_state: any;
  initial_state: any;
  total_explored: number;
  execution_time_ms: number;
  path_cost: number;
  heuristic_cost: number;
  evaluation_f: number;
  explored_nodes: SearchNode[];
  nodes_per_step: any[];
  frontier_snapshots?: any[];
  scheduled_activities: any[];
}

export interface CSPStep {
  step: number;
  variable: string;
  day?: number;
  slot?: string;
  value: string;
  action: string;
  result: string;
  constraint?: string;
  reason?: string;
  domain_size?: number;
}

export interface CSPResult {
  solved: boolean;
  assignment: Record<string, string>;
  scheduled_slots: any[];
  total_steps: number;
  backtracks: number;
  execution_time_ms: number;
  steps: CSPStep[];
  variables_count: number;
  constraints_count: number;
}
