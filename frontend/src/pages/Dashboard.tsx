import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Calendar,
  DollarSign,
  MapPin,
  Trash2,
  ArrowRight,
  Sparkles,
  Sliders,
  Users,
  Clock,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tripsAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await tripsAPI.list();
      setTrips(data);
    } catch (e) {
      console.error('Failed to load trips:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (tripId: string) => {
    if (window.confirm('Delete this saved trip plan?')) {
      await tripsAPI.delete(tripId);
      setTrips(trips.filter((t) => t.id !== tripId));
    }
  };

  const totalSpent = trips.reduce(
    (sum, t) => sum + (t.itinerary?.total_estimated_expenditure || t.params?.budget || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Welcome & Stats Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-800 text-xs font-semibold text-teal mb-3 border border-navy-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Travel Workspace</span>
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white">
            Welcome back, {user?.name || 'Traveler'}
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Review your saved itineraries, audit algorithmic search states, or synthesize a new trip.
          </p>
        </div>

        <Link to="/plan">
          <Button
            icon={<Plus className="w-4 h-4" />}
            className="bg-primary hover:bg-primary-600 shadow-lg shadow-primary/30"
          >
            Create New Trip
          </Button>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-gray-400 text-xs font-semibold block uppercase">Saved Trips</span>
          <div className="text-2xl font-bold text-navy-900 mt-1">{trips.length} Plans</div>
          <span className="text-[11px] text-teal font-medium">Deterministic verified</span>
        </Card>
        <Card className="p-5">
          <span className="text-gray-400 text-xs font-semibold block uppercase">Total Planned Budget</span>
          <div className="text-2xl font-bold text-navy-900 mt-1">₹{totalSpent.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-gray-400">Across all trips</span>
        </Card>
        <Card className="p-5">
          <span className="text-gray-400 text-xs font-semibold block uppercase">AI Algorithms Active</span>
          <div className="text-2xl font-bold text-primary mt-1">5 Solvers</div>
          <span className="text-[11px] text-gray-400">A*, CSP, FC, Forward Chaining</span>
        </Card>
        <Card className="p-5">
          <span className="text-gray-400 text-xs font-semibold block uppercase">Autonomous Agents</span>
          <div className="text-2xl font-bold text-teal mt-1">5 Agents</div>
          <span className="text-[11px] text-teal font-medium">PEAS Synchronized</span>
        </Card>
      </div>

      {/* Quick Launch Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/ai-explorer">
          <Card hover className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-navy-900">AI Algorithm Visualizer</div>
                <div className="text-xs text-text-secondary">Explore search tree & CSP steps</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Card>
        </Link>

        <Link to="/budget-simulator">
          <Card hover className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-navy-900">Budget Simulator</div>
                <div className="text-xs text-text-secondary">Interactive what-if recalculator</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Card>
        </Link>

        <Link to="/group-optimizer">
          <Card hover className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-navy-900">Group Optimizer</div>
                <div className="text-xs text-text-secondary">Pareto-optimal group balancer</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Card>
        </Link>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-navy-900">Your Generated Trips</h2>
          <span className="text-xs text-gray-400 font-mono">{trips.length} Total</span>
        </div>

        {trips.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-surface text-gray-400 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-navy-900">No Trips Created Yet</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Launch the trip wizard to experience constraint-satisfaction travel synthesis in seconds.
              </p>
            </div>
            <Link to="/plan">
              <Button size="sm">Create First Itinerary</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card key={trip.id} hover className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="teal" size="sm">
                      {trip.status === 'generated' ? 'Plan Ready' : 'Draft'}
                    </Badge>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-navy-900">{trip.title}</h3>
                  <div className="text-xs text-primary font-semibold capitalize mt-0.5">
                    {trip.destination}
                  </div>

                  <div className="space-y-1.5 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration</span>
                      <span className="font-semibold text-navy-900">{trip.params?.num_days || 3} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Planned Budget</span>
                      <span className="font-bold font-mono text-teal">
                        ₹{Number(trip.params?.budget || 20000).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-gray-100 mt-4 flex items-center justify-between">
                  {trip.status === 'generated' ? (
                    <Link
                      to={`/itinerary/${trip.id}`}
                      className="text-xs font-bold text-primary hover:text-primary-600 flex items-center gap-1"
                    >
                      Open Itinerary <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      to={`/itinerary/${trip.id}`}
                      className="text-xs font-bold text-teal hover:underline flex items-center gap-1"
                    >
                      Generate Now <Sparkles className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <span className="text-[10px] text-gray-400 font-mono">
                    ID: {trip.id.slice(0, 8)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

