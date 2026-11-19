import React, { useState } from 'react';
import { Bot, CheckCircle2, Clock, Sparkles, ChevronDown, ChevronUp, Terminal, ShieldAlert } from 'lucide-react';
import { AgentLog } from '../../services/types';

interface AgentActivityPanelProps {
  logs?: AgentLog[];
  isGenerating?: boolean;
  peasFramework?: Record<string, Record<string, string>>;
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({
  logs = [],
  isGenerating = false,
  peasFramework
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [showPeas, setShowPeas] = useState<boolean>(false);

  const agents = [
    { name: 'DestinationResearchAgent', label: 'Destination Researcher', color: 'text-blue-500 bg-blue-50' },
    { name: 'UserPreferenceAgent', label: 'Preference Evaluator', color: 'text-indigo-500 bg-indigo-50' },
    { name: 'ItineraryPlanningAgent', label: 'A* State Search Planner', color: 'text-purple-500 bg-purple-50' },
    { name: 'ConstraintValidationAgent', label: 'CSP Constraint Validator', color: 'text-teal-600 bg-teal-50' },
    { name: 'OptimizationRecoveryAgent', label: 'Route & Dynamic Recovery', color: 'text-emerald-500 bg-emerald-50' },
  ];

  return (
    <div className="bg-navy-900 rounded-2xl border border-navy-800 text-white overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-teal" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              Autonomous AI Agent Team
              {isGenerating ? (
                <span className="flex items-center gap-1.5 text-[11px] text-teal font-normal">
                  <span className="w-2 h-2 rounded-full bg-teal animate-ping" />
                  Synthesizing
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-normal">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Execution Complete
                </span>
              )}
            </h3>
            <p className="text-[11px] text-gray-400">
              Multi-Agent Architecture (Topic 5 PEAS Framework)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {peasFramework && (
            <button
              onClick={() => setShowPeas(!showPeas)}
              className="text-xs px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-gray-300 font-medium transition-colors"
            >
              {showPeas ? 'Hide PEAS' : 'View PEAS Framework'}
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-navy-800 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-4">
          {/* Agent Workflow Pipeline Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {agents.map((agent, index) => {
              const hasLogs = logs.some((l) => l.agent === agent.name);
              return (
                <div
                  key={agent.name}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    hasLogs
                      ? 'bg-navy-800/80 border-navy-700 text-white'
                      : 'bg-navy-950/40 border-navy-900 text-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-gray-400">0{index + 1}</span>
                    {hasLogs ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-gray-600" />
                    )}
                  </div>
                  <div className="font-semibold text-xs leading-tight mb-1">{agent.label}</div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    {hasLogs ? 'Tasks Complete' : 'Standing By'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PEAS Modal/Section */}
          {showPeas && peasFramework && (
            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-3">
              <h4 className="text-xs font-bold text-teal uppercase tracking-wider">
                PEAS Formal Specification (Course Topic 5)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {Object.entries(peasFramework).map(([agentName, peas]) => (
                  <div key={agentName} className="p-3 rounded-lg bg-navy-900 border border-navy-800">
                    <div className="font-bold text-white mb-1.5">{agentName}</div>
                    <div className="space-y-1 text-gray-300 text-[11px]">
                      <div><strong className="text-teal">Performance:</strong> {peas.Performance_Measure}</div>
                      <div><strong className="text-blue-400">Environment:</strong> {peas.Environment}</div>
                      <div><strong className="text-amber-400">Actuators:</strong> {peas.Actuators}</div>
                      <div><strong className="text-purple-400">Sensors:</strong> {peas.Sensors}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terminal Logs Feed */}
          {logs.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-mono">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-teal" />
                  Agent Execution Log Stream ({logs.length} events)
                </span>
                <span>Deterministic AI Trace</span>
              </div>
              <div className="max-h-44 overflow-y-auto rounded-xl bg-black/50 border border-navy-800 p-3 font-mono text-[11px] space-y-1.5">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-gray-300">
                    <span className="text-gray-500 shrink-0">[{log.time_str}]</span>
                    <span className="text-teal font-semibold shrink-0">[{log.agent}]:</span>
                    <span className={log.level === 'WARNING' ? 'text-amber-300' : 'text-gray-200'}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

