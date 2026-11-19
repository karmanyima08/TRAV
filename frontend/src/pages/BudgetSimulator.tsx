import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sliders,
  DollarSign,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { tripsAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const BudgetSimulator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId') || 'demo_trip_jaipur';

  const [newBudget, setNewBudget] = useState<number>(35000);
  const [loading, setLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  const runSimulation = async (budgetVal: number) => {
    setLoading(true);
    try {
      // First ensure a trip exists or create a demo trip
      let activeTripId = tripId;
      try {
        await tripsAPI.get(activeTripId);
      } catch {
        const created = await tripsAPI.create({
          title: 'Jaipur Heritage Budget Test',
          destination: 'jaipur',
          num_days: 3,
          budget: 20000,
          interests: ['historical', 'cultural'],
        });
        await tripsAPI.generateItinerary(created.id);
        activeTripId = created.id;
      }

      const res = await tripsAPI.simulateBudget(activeTripId, budgetVal);
      setSimResult(res);
    } catch (err: any) {
      alert(`Simulation error: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation(35000);
  }, []);

  const chartData = simResult
    ? [
        {
          category: 'Attractions',
          Original: simResult.original_cost_breakdown?.attractions || 1500,
          Modified: simResult.new_cost_breakdown?.attractions || 2200,
        },
        {
          category: 'Dining',
          Original: simResult.original_cost_breakdown?.food || 3000,
          Modified: simResult.new_cost_breakdown?.food || 4500,
        },
        {
          category: 'Transport',
          Original: simResult.original_cost_breakdown?.transport || 1500,
          Modified: simResult.new_cost_breakdown?.transport || 2500,
        },
        {
          category: 'Hotel',
          Original: simResult.original_cost_breakdown?.accommodation || 8000,
          Modified: simResult.new_cost_breakdown?.accommodation || 15000,
        },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" size="sm">Dynamic What-If Engine</Badge>
            <Badge variant="primary" size="sm">Course Objective #5</Badge>
          </div>
          <h1 className="text-3xl font-bold font-display text-navy-900 tracking-tight">
            Budget What-If Simulator
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Observe how adjusting travel budget reallocates attraction tiers, hotel standards, and meal selections in real time.
          </p>
        </div>

        <Link
          to="/plan"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          Plan a new trip instead <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Interactive Slider Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal">Adjust Planned Budget</span>
            <div className="text-3xl font-black font-display text-navy-900 mt-1 font-mono">
              ₹{newBudget.toLocaleString('en-IN')}
            </div>
          </div>

          <Button
            onClick={() => runSimulation(newBudget)}
            loading={loading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Recalculate Itinerary
          </Button>
        </div>

        <input
          type="range"
          min="5000"
          max="80000"
          step="2500"
          value={newBudget}
          onChange={(e) => setNewBudget(parseInt(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-gray-400 font-mono">
          <span>₹5,000 (Shoestring)</span>
          <span>₹20,000 (Baseline)</span>
          <span>₹50,000 (Comfort)</span>
          <span>₹80,000 (Luxury)</span>
        </div>
      </Card>

      {/* Side-by-Side Comparison */}
      {simResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Card */}
            <Card className="p-6 space-y-4 border-gray-200">
              <div className="flex items-center justify-between">
                <Badge variant="neutral" size="sm">Baseline Budget</Badge>
                <span className="text-xs font-mono font-bold text-gray-500">
                  ₹{Number(simResult.original_budget).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-navy-900">
                  ₹{Number(simResult.original_expenditure).toLocaleString('en-IN')}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">Calculated total trip expenditure</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                {Object.entries(simResult.original_cost_breakdown || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500 capitalize">{k}</span>
                    <span className="font-bold font-mono text-navy-900">₹{Number(v)}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Modified Card */}
            <Card className="p-6 space-y-4 border-teal/40 bg-teal-50/20">
              <div className="flex items-center justify-between">
                <Badge variant="teal" size="sm">Simulated Budget Plan</Badge>
                <span className="text-xs font-mono font-bold text-teal">
                  ₹{Number(simResult.new_budget).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-navy-900">
                  ₹{Number(simResult.new_expenditure).toLocaleString('en-IN')}
                </h3>
                <p className="text-xs text-teal font-medium mt-0.5 flex items-center gap-1">
                  {simResult.budget_diff >= 0 ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5" /> +₹{simResult.budget_diff.toLocaleString('en-IN')} expanded budget allocation
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3.5 h-3.5" /> -₹{Math.abs(simResult.budget_diff).toLocaleString('en-IN')} savings constrained
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-teal-100 text-xs">
                {Object.entries(simResult.new_cost_breakdown || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{k}</span>
                    <span className="font-bold font-mono text-teal">₹{Number(v)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Comparative Bar Chart */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-navy-900">
              Comparative Category Expenditure (Original vs Simulated)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Original" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Modified" fill="#20BFA9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

