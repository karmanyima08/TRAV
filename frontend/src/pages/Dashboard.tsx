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
  ShieldCheck,
  Bookmark,
  ExternalLink,
  Footprints
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { tripsAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { getDestinationById } from '../data/destinations';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { savedTrips, deleteSavedTrip, setCurrentTrip, setGeneratedItinerary } = useTrip();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tripFilter, setTripFilter] = useState<'all' | 'ready' | 'draft'>('all');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await tripsAPI.list();
      // Merge backend trips with locally persisted savedTrips
      const map = new Map<string, any>();
      (savedTrips || []).forEach((t) => {
        if (t?.id) map.set(t.id, t);
      });
      (data || []).forEach((t: any) => {
        if (t?.id) {
          map.set(t.id, { ...map.get(t.id), ...t });
        }
      });
      setTrips(Array.from(map.values()));
    } catch (e) {
      console.warn('Backend tripsAPI.list unavailable, falling back to local savedTrips:', e);
      setTrips(savedTrips || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [savedTrips.length]);

  const handleDelete = async (tripId: string) => {
    if (window.confirm('Delete this saved trip plan?')) {
      try {
        await tripsAPI.delete(tripId);
      } catch (e) {
        console.warn('Backend delete failed, removing locally:', e);
      }
      deleteSavedTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    }
  };

  const scrollToSavedTrips = () => {
    const el = document.getElementById('saved-trips');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalSpent = trips.reduce(
    (sum, t) => sum + (t.itinerary?.total_estimated_expenditure || t.params?.budget || 0),
    0
  );

  const uniqueCities = new Set(trips.map((t) => t.destination).filter(Boolean)).size;
  const totalDays = trips.reduce((sum, t) => sum + (t.params?.num_days || 3), 0);

  const displayedTrips = trips.filter((t) => {
    if (tripFilter === 'ready') return t.status === 'generated' || !!t.itinerary;
    if (tripFilter === 'draft') return t.status !== 'generated' && !t.itinerary;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Guest Mode Banner if not signed in */}
      {!user && (
        <div className="bg-gradient-to-r from-teal-50 to-primary/10 border border-teal-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-bold text-navy-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              Save Itineraries to Your Personal Account
            </div>
            <p className="text-xs text-text-secondary">
              Sign up or log in to automatically sync your trips across devices, keep customized schedules, and track budgets.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/login">
              <Button size="sm" variant="ghost" className="border border-teal text-teal hover:bg-teal-50">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary hover:bg-primary-600">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Welcome & Stats Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-800 text-xs font-semibold text-teal mb-3 border border-navy-700">
            <Compass className="w-3.5 h-3.5" />
            <span>{user ? 'Account Workspace' : 'Traveler Workspace'}</span>
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white">
            {user ? `Welcome back, ${user.name}` : 'Welcome, Traveler'}
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            {user
              ? `Account: ${user.email} • Review your saved itineraries, plan new destinations, or customize your schedules.`
              : 'Review your saved trips below, or create an account to save your itineraries permanently.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={scrollToSavedTrips}
            className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Bookmark className="w-4 h-4 text-teal" />
            <span>View Saved Trips ({trips.length})</span>
          </button>
          <Link to="/plan">
            <Button
              icon={<Plus className="w-4 h-4" />}
              className="bg-primary hover:bg-primary-600 shadow-lg shadow-primary/30"
            >
              Plan New Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card
          onClick={scrollToSavedTrips}
          hover
          className="p-5 cursor-pointer border-l-4 border-l-primary group"
        >
          <span className="text-gray-400 text-xs font-semibold block uppercase group-hover:text-primary transition-colors">
            Saved Trips Point
          </span>
          <div className="text-2xl font-black text-navy-900 mt-1 flex items-center gap-2">
            <span>{trips.length} Plans</span>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <span className="text-[11px] text-teal font-medium">Click to view all</span>
        </Card>
        <Card className="p-5">
          <span className="text-gray-400 text-xs font-semibold block uppercase">Total Planned Budget</span>
          <div className="text-2xl font-black text-navy-900 mt-1">₹{totalSpent.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-gray-400">Across all trips</span>
        </Card>
        <Card className="p-5">
          <span className="text-gray-400 text-xs font-semibold block uppercase">Cities Explored</span>
          <div className="text-2xl font-black text-primary mt-1">{uniqueCities} Destinations</div>
          <span className="text-[11px] text-gray-400">Curated Indian hubs</span>
        </Card>
        <Card className="p-5">
          <span className="text-gray-400 text-xs font-semibold block uppercase">Days Planned</span>
          <div className="text-2xl font-black text-teal mt-1">{totalDays} Days</div>
          <span className="text-[11px] text-teal font-medium">Full itineraries</span>
        </Card>
      </div>

      {/* Quick Launch Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/budget-simulator">
          <Card hover className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-navy-900">Budget Simulator</div>
                <div className="text-xs text-text-secondary">Interactive budget reallocation & live cost breakdown</div>
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
                <div className="font-bold text-sm text-navy-900">Group Trip Planner</div>
                <div className="text-xs text-text-secondary">Balance travel preferences for the whole group</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Card>
        </Link>
      </div>

      {/* SAVED TRIPS POINT SECTION */}
      <div id="saved-trips" className="scroll-mt-24 space-y-4 pt-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal uppercase tracking-wider mb-1">
              <Bookmark className="w-4 h-4" />
              <span>Saved Trip Point</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-navy-900">Your Saved Itineraries</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Access your personalized routes, day-by-day schedules, and budget allocations.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-gray-200/80 self-start sm:self-auto">
            <button
              onClick={() => setTripFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                tripFilter === 'all' ? 'bg-navy-900 text-white shadow-sm' : 'text-text-secondary hover:text-navy-900'
              }`}
            >
              All ({trips.length})
            </button>
            <button
              onClick={() => setTripFilter('ready')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                tripFilter === 'ready' ? 'bg-teal text-white shadow-sm' : 'text-text-secondary hover:text-navy-900'
              }`}
            >
              Plan Ready ({trips.filter((t) => t.status === 'generated' || !!t.itinerary).length})
            </button>
            <button
              onClick={() => setTripFilter('draft')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                tripFilter === 'draft' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-navy-900'
              }`}
            >
              Drafts ({trips.filter((t) => t.status !== 'generated' && !t.itinerary).length})
            </button>
          </div>
        </div>

        {trips.length === 0 ? (
          <Card className="p-12 text-center space-y-4 rounded-3xl border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-navy-900">No Saved Trips Yet</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Launch the trip planning wizard to design your first customized travel itinerary with real photos and smart routes.
              </p>
            </div>
            <Link to="/plan">
              <Button size="lg" className="bg-primary hover:bg-primary-600 shadow-md">
                Plan Your First Trip
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTrips.map((trip) => {
              const destInfo = getDestinationById(trip.destination);
              const isReady = trip.status === 'generated' || !!trip.itinerary;

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  {/* Photo Header */}
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={destInfo.image}
                      alt={destInfo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                    {/* Top Chips */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                        {destInfo.state}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant={isReady ? 'teal' : 'primary'} size="sm">
                          {isReady ? 'Plan Ready' : 'Draft'}
                        </Badge>
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-red-400 flex items-center justify-center transition-colors border border-white/20"
                          title="Delete Trip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 inset-x-3 z-10 text-white">
                      <div className="text-lg font-bold font-display drop-shadow">
                        {destInfo.name}
                      </div>
                      <div className="text-[11px] text-gray-200 line-clamp-1">
                        {destInfo.tagline}
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-sm text-navy-900 leading-snug line-clamp-1">
                        {trip.title || `Trip to ${destInfo.name}`}
                      </h3>

                      {/* Highlights Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 rounded-xl bg-surface border border-gray-100">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Duration</span>
                          <span className="font-bold text-navy-900">{trip.params?.num_days || 3} Days</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface border border-gray-100">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Budget</span>
                          <span className="font-bold text-teal font-mono">
                            ₹{Number(trip.params?.budget || 20000).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Travel Style Tag */}
                      <div className="flex items-center gap-2 text-[11px] text-text-secondary pt-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>Starts {trip.params?.start_date || 'Upcoming'}</span>
                        <span>•</span>
                        <span className="capitalize">{trip.params?.travel_type || 'Solo'}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      {isReady ? (
                        <Link
                          to={`/itinerary/${trip.id}`}
                          onClick={() => {
                            setCurrentTrip(trip);
                            if (trip.itinerary) setGeneratedItinerary(trip.itinerary);
                          }}
                          className="w-full text-center py-2 px-3 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <span>Open Itinerary</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          to={`/itinerary/${trip.id}`}
                          onClick={() => {
                            setCurrentTrip(trip);
                          }}
                          className="w-full text-center py-2 px-3 rounded-xl bg-teal hover:bg-teal-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Plan Now</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
