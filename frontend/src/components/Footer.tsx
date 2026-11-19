import React from 'react';
import { Compass, Sparkles, BookOpen, Shield, Code, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-900 text-gray-300 pt-16 pb-12 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-navy-800/80">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-teal flex items-center justify-center text-white">
                <Compass className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                TRAVORA
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              An intelligent, constraint-based and adaptive travel planning system. Powered by State Space Search, CSP Backtracking with MRV/LCV, and Multi-Agent expert reasoning.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-navy-800 text-[11px] font-mono text-teal">
              <span>CSE3705 AI Course Project</span>
            </div>
          </div>

          {/* AI Core Capabilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              AI Handout Topics
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>Topic 2: State Space Search (A*, BFS, DFS, UCS)</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-teal"></span>
                <span>Topic 3: CSP Solver (MRV, Degree, LCV, FC)</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>Topic 4: Forward Chaining Knowledge Base</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Topic 5: PEAS Intelligent Multi-Agents</span>
              </li>
            </ul>
          </div>

          {/* Academic Metadata */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Project Specification
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>Course: CSE3705 Artificial Intelligence</li>
              <li>Official Title: Travel Trip Planner: A Constraint-Based and Adaptive Travel Planning System</li>
              <li>Group: AI Group 4</li>
              <li>Members: Gaurang Mudgil, Hardik Sardana, Ishant Rai, Karma Nyima, Himanshu Yadav</li>
            </ul>
          </div>

          {/* Platform Status */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Engine Status
            </h4>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="p-3 rounded-xl bg-navy-800/80 border border-navy-700/60">
                <div className="flex items-center justify-between text-white font-medium mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Deterministic AI Active
                  </span>
                  <span className="text-[11px] text-teal">v1.0.0</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  A* Heuristic and CSP Forward Checking verified operational.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 TRAVORA — Built for University AI Research & Demonstration.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-gray-400 transition-colors">Algorithmic Transparency</span>
            <span className="hover:text-gray-400 transition-colors">GitHub Repository</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

