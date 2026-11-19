import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  SkipForward,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingDown,
  Clock
} from 'lucide-react';
import { aiAPI } from '../services/api';
import { SearchResult, CSPResult } from '../services/types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const AIExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'csp'>('search');

  // Search State
  const [selectedAlgo, setSelectedAlgo] = useState<string>('astar');
  const [destination, setDestination] = useState<string>('jaipur');
  const [numDays, setNumDays] = useState<number>(2);
  const [budget, setBudget] = useState<number>(15000);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // CSP State
  const [cspLoading, setCspLoading] = useState<boolean>(false);
  const [cspResult, setCspResult] = useState<CSPResult | null>(null);
  const [cspStep, setCspStep] = useState<number>(0);

  // Run Search Algorithm
  const handleRunSearch = async () => {
    setSearchLoading(true);
    setIsPlaying(false);
    setCurrentStep(0);
    try {
      const data = await aiAPI.runSearch({
        destination,
        algorithm: selectedAlgo,
        num_days: numDays,
        budget,
        interests: ['historical', 'cultural'],
        walking_comfort: 'moderate',
        transport_preference: 'auto',
      });
      setSearchResult(data);
    } catch (e: any) {
      alert(`Search error: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  // Run CSP Solver
  const handleRunCSP = async () => {
    setCspLoading(true);
    setCspStep(0);
    try {
      const data = await aiAPI.runCSP({
        destination,
        num_days: numDays,
        budget,
        interests: ['historical'],
        walking_comfort: 'moderate',
      });
      setCspResult(data);
    } catch (e: any) {
      alert(`CSP error: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setCspLoading(false);
    }
  };

  // Step-by-step Auto Play
  React.useEffect(() => {
    let timer: any;
    if (isPlaying && searchResult && searchResult.nodes_per_step.length > 0) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < searchResult.nodes_per_step.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 700);
    }
    return () => clearInterval(timer);
  }, [isPlaying, searchResult]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" size="sm">Academic AI Engine</Badge>
            <Badge variant="primary" size="sm">Course Topics 2 & 3</Badge>
          </div>
          <h1 className="text-3xl font-bold font-display text-navy-900 tracking-tight">
            AI Algorithm Explorer & Visualizer
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Observe real state-space expansions, priority queue frontiers, evaluation functions, and CSP constraint propagation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-surface border border-gray-200">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-navy-900'
            }`}
          >
            State Space Search (Topic 2)
          </button>
          <button
            onClick={() => setActiveTab('csp')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'csp'
                ? 'bg-teal text-white shadow-sm'
                : 'text-text-secondary hover:text-navy-900'
            }`}
          >
            CSP Solver (Topic 3)
          </button>
        </div>
      </div>

      {/* TAB 1: STATE SPACE SEARCH */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Algorithm Config Card */}
          <Card className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Select Algorithm
                </label>
                <select
                  value={selectedAlgo}
                  onChange={(e) => setSelectedAlgo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-navy-900 focus:outline-none focus:border-primary"
                >
                  <option value="astar">A* Search (Optimal f=g+h)</option>
                  <option value="greedy">Greedy Best-First (h only)</option>
                  <option value="ucs">Uniform Cost Search (g only)</option>
                  <option value="bfs">Breadth-First Search (BFS)</option>
                  <option value="dfs">Depth-First Search (DFS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Destination City
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-navy-900 focus:outline-none focus:border-primary"
                >
                  <option value="jaipur">Jaipur (Pink City)</option>
                  <option value="delhi">Delhi NCR</option>
                  <option value="goa">Goa Coast</option>
                  <option value="agra">Agra</option>
                  <option value="varanasi">Varanasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={numDays}
                  onChange={(e) => setNumDays(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Budget (₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value) || 10000)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono"
                />
              </div>

              <Button
                onClick={handleRunSearch}
                loading={searchLoading}
                icon={<Play className="w-3.5 h-3.5" />}
              >
                Execute Algorithm
              </Button>
            </div>
          </Card>

          {/* Results Display */}
          {searchResult && (
            <div className="space-y-6">
              {/* Telemetry Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-card text-xs">
                  <span className="text-gray-400 block text-[10px] font-semibold uppercase">Algorithm</span>
                  <span className="font-extrabold text-navy-900 font-mono text-sm">{searchResult.algorithm}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-card text-xs">
                  <span className="text-gray-400 block text-[10px] font-semibold uppercase">States Explored</span>
                  <span className="font-extrabold text-primary font-mono text-sm">{searchResult.total_explored}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-card text-xs">
                  <span className="text-gray-400 block text-[10px] font-semibold uppercase">Execution Time</span>
                  <span className="font-extrabold text-teal font-mono text-sm">{searchResult.execution_time_ms} ms</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-card text-xs">
                  <span className="text-gray-400 block text-[10px] font-semibold uppercase">Path Cost g(n)</span>
                  <span className="font-extrabold text-navy-900 font-mono text-sm">₹{searchResult.path_cost}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-card text-xs">
                  <span className="text-gray-400 block text-[10px] font-semibold uppercase">Heuristic h(n)</span>
                  <span className="font-extrabold text-purple-600 font-mono text-sm">₹{searchResult.heuristic_cost}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-card text-xs">
                  <span className="text-gray-400 block text-[10px] font-semibold uppercase">Solution Found</span>
                  <span className={`font-extrabold font-mono text-sm ${searchResult.solution_found ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {searchResult.solution_found ? 'OPTIMAL GOAL' : 'FEASIBLE PATH'}
                  </span>
                </div>
              </div>

              {/* Step-by-Step Interactive Playback Controller */}
              {searchResult.nodes_per_step.length > 0 && (
                <Card className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="font-bold text-sm text-navy-900">
                        Step-by-Step Search Space Exploration
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Observe state node expansions at Step {currentStep + 1} of {searchResult.nodes_per_step.length}.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? 'Pause' : 'Auto Play'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setCurrentStep(Math.min(searchResult.nodes_per_step.length - 1, currentStep + 1))}
                        disabled={currentStep === searchResult.nodes_per_step.length - 1}
                      >
                        Next Step
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
                        icon={<RotateCcw className="w-3.5 h-3.5" />}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>

                  {/* Active Node Telemetry Card */}
                  {searchResult.nodes_per_step[currentStep] && (
                    <div className="p-4 rounded-2xl bg-navy-900 text-white grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-mono">Current Node</span>
                        <span className="font-bold text-teal">Node #{searchResult.nodes_per_step[currentStep].node_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-mono">Tree Depth</span>
                        <span className="font-bold text-white">Depth {searchResult.nodes_per_step[currentStep].depth}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-mono">Path Cost g(n)</span>
                        <span className="font-bold text-white">₹{searchResult.nodes_per_step[currentStep].g_cost}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-mono">Heuristic h(n)</span>
                        <span className="font-bold text-teal">₹{searchResult.nodes_per_step[currentStep].h_cost}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-mono">Evaluation f(n)</span>
                        <span className="font-bold text-amber-400">₹{searchResult.nodes_per_step[currentStep].f_cost}</span>
                      </div>
                    </div>
                  )}

                  {/* SVG State Space Tree Visualization */}
                  <div className="p-4 rounded-2xl bg-surface border border-gray-200 overflow-x-auto">
                    <div className="text-xs font-semibold text-text-secondary mb-3 flex items-center justify-between">
                      <span>Search Tree Graph Visualizer (Nodes & Transitions)</span>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary" /> Frontier</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Explored</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /> Current</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400" /> Goal</span>
                      </div>
                    </div>

                    <svg className="w-full min-w-[700px] h-64 bg-white rounded-xl border border-gray-100 shadow-inner">
                      {/* Tree branches / connecting lines */}
                      {searchResult.nodes_per_step.slice(0, currentStep + 1).map((node, i) => {
                        const x = 50 + (i % 12) * 52;
                        const y = 40 + (node.depth * 38);
                        const px = i === 0 ? x : 50 + ((i - 1) % 12) * 52;
                        const py = i === 0 ? y : 40 + (Math.max(0, node.depth - 1) * 38);
                        return (
                          <line
                            key={`line-${i}`}
                            x1={px}
                            y1={py}
                            x2={x}
                            y2={y}
                            stroke="#E2E8F0"
                            strokeWidth="1.5"
                          />
                        );
                      })}

                      {/* State Nodes */}
                      {searchResult.nodes_per_step.slice(0, currentStep + 1).map((node, i) => {
                        const x = 50 + (i % 12) * 52;
                        const y = 40 + (node.depth * 38);
                        const isCurrent = i === currentStep;
                        const isGoal = node.is_goal;
                        return (
                          <g key={`node-${i}`} className="cursor-pointer">
                            <circle
                              cx={x}
                              cy={y}
                              r={isCurrent ? 14 : 10}
                              fill={isGoal ? '#F59E0B' : isCurrent ? '#F43F5E' : '#10B981'}
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              className="transition-all duration-200"
                            />
                            <text
                              x={x}
                              y={y + 3}
                              fontSize="8"
                              fontWeight="bold"
                              fill="#FFFFFF"
                              textAnchor="middle"
                            >
                              {node.node_id}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </Card>
              )}

              {/* Final Solution Path Sequence */}
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-sm text-navy-900">
                  Optimal Solution Path Sequence (Search Tree Reconstructed)
                </h3>
                <div className="space-y-2">
                  {searchResult.solution_path.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface border border-gray-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-navy-900">
                            {item.action?.attraction_id ? item.action.attraction_id.toUpperCase() : 'INITIAL STARTING STATE'}
                          </span>
                          <span className="text-gray-400 text-[11px] block">
                            Day {item.state.current_day} • Time: {item.state.current_time_str} • Remaining Budget: ₹{item.state.remaining_budget}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 font-mono text-[11px]">
                        <span>g(n): ₹{item.g_cost}</span>
                        <span>h(n): ₹{item.h_cost}</span>
                        <span className="font-bold text-teal">f(n): ₹{item.f_cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CSP SOLVER */}
      {activeTab === 'csp' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Destination City
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-navy-900"
                >
                  <option value="jaipur">Jaipur (Pink City)</option>
                  <option value="delhi">Delhi NCR</option>
                  <option value="goa">Goa Coast</option>
                  <option value="agra">Agra</option>
                  <option value="varanasi">Varanasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={numDays}
                  onChange={(e) => setNumDays(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Total Budget (₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value) || 15000)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono"
                />
              </div>

              <Button
                onClick={handleRunCSP}
                loading={cspLoading}
                icon={<Layers className="w-3.5 h-3.5" />}
                className="bg-teal text-white hover:bg-teal-600"
              >
                Solve via Backtracking + MRV
              </Button>
            </div>
          </Card>

          {/* CSP Results */}
          {cspResult && (
            <div className="space-y-6">
              {/* Telemetry bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-card text-xs">
                  <span className="text-gray-400 block text-[10px] font-semibold uppercase">CSP Status</span>
                  <span className={`font-extrabold text-sm font-mono ${cspResult.solved ? 'text-teal' : 'text-amber-500'}`}>
                    {cspResult.solved ? '100% SATISFIED' : 'UNSATISFIABLE'}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-card text-xs">
                  <span className="text-gray-400 block text-[10px] font-semibold uppercase">Variables</span>
                  <span className="font-extrabold text-navy-900 text-sm font-mono">{cspResult.variables_count} Slots</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-card text-xs">
                  <span className="text-gray-400 block text-[10px] font-semibold uppercase">Constraints</span>
                  <span className="font-extrabold text-navy-900 text-sm font-mono">{cspResult.constraints_count} Active</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-card text-xs">
                  <span className="text-gray-400 block text-[10px] font-semibold uppercase">Total Steps</span>
                  <span className="font-extrabold text-primary text-sm font-mono">{cspResult.total_steps}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-card text-xs">
                  <span className="text-gray-400 block text-[10px] font-semibold uppercase">Backtracks</span>
                  <span className="font-extrabold text-rose-600 text-sm font-mono">{cspResult.backtracks}</span>
                </div>
              </div>

              {/* Final Assignment Grid */}
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-sm text-navy-900">
                  Feasible Variable Assignments (Final Solution)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {cspResult.scheduled_slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 bg-surface space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-gray-500 font-mono text-[10px]">
                        <span>Day {slot.day} • {slot.slot_label.toUpperCase()}</span>
                        <span>{slot.time_window}</span>
                      </div>
                      <div className="font-bold text-navy-900 text-sm">{slot.attraction_name}</div>
                      <div className="text-[11px] text-teal font-medium">
                        {slot.entry_fee === 0 ? 'Free Entry' : `₹${slot.entry_fee}`} • {slot.duration_hours}h
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* CSP Step-by-Step Backtracking Log */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-navy-900">
                    Forward Checking & Backtracking Trace (Audit Log)
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    Showing first {cspResult.steps.length} solver operations
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100 font-mono text-xs">
                  {cspResult.steps.map((st, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">#{st.step}</span>
                        <span className="font-bold text-navy-900">{st.variable}</span>
                        <span className="text-gray-500">→ {st.value}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            st.action === 'BACKTRACK' ? 'danger' :
                            st.result === 'INCONSISTENT' ? 'warning' : 'teal'
                          }
                          size="sm"
                        >
                          {st.action}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

