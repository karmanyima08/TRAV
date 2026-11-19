import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Info,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Utensils,
  Car,
  Footprints,
  Sliders,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { tripsAPI } from '../services/api';
import { useTrip } from '../context/TripContext';
import { Itinerary, Activity } from '../services/types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { InteractiveRouteMap } from '../components/InteractiveRouteMap';
import { getDestinationById } from '../data/destinations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const formatWhyPicked = (explanation?: string, category?: string) => {
  if (!explanation) {
    return `Matches your travel interests and preferred schedule.`;
  }
  let text = explanation
    .replace(/Rule\s+[A-Za-z0-9_-]+/gi, '')
    .replace(/R\d{3}/gi, '')
    .replace(/\b(CSP|A\*|MRV|LCV|Forward Chaining|PEAS|XAI|heuristic)\b/gi, '')
    .trim();
  if (!text || text.length < 5) {
    return `Matches your interest in ${category || 'local sights'} and fits your daily schedule.`;
  }
  return text;
};

export const ItineraryPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { currentTrip, setCurrentTrip, generatedItinerary, setGeneratedItinerary } = useTrip();

  // If generatedItinerary is for this tripId, use it as initial state
  const isMatchingCached =
    generatedItinerary &&
    ((generatedItinerary as any).trip_id === tripId || currentTrip?.id === tripId);

  const [itinerary, setItinerary] = useState<Itinerary | null>(
    isMatchingCached ? generatedItinerary : null
  );
  const [activeDay, setActiveDay] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(!isMatchingCached);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Recovery Modal State
  const [recoveryModalOpen, setRecoveryModalOpen] = useState<boolean>(false);
  const [targetRecoveryActivity, setTargetRecoveryActivity] = useState<Activity | null>(null);
  const [recoveryReason, setRecoveryReason] = useState<string>('Unexpected monument closure');
  const [recoveryLoading, setRecoveryLoading] = useState<boolean>(false);
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      if ((!itinerary || currentTrip?.id !== tripId) && tripId) {
        setLoading(true);
        try {
          const data = await tripsAPI.getItinerary(tripId);
          setItinerary(data);
          setGeneratedItinerary(data);
          try {
            const tripObj = await tripsAPI.get(tripId);
            if (tripObj) setCurrentTrip(tripObj);
          } catch {}
        } catch (err) {
          console.error('Failed to load itinerary:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchItinerary();
  }, [tripId]);

  if (loading || !itinerary) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold font-display text-navy-900">
          Generating Your Personalized Itinerary...
        </h2>
        <p className="text-xs text-text-secondary">
          Finding the best attractions, timing, and routes for your trip.
        </p>
      </div>
    );
  }

  const currentDayPlan = itinerary.days.find((d) => d.day_number === activeDay) || itinerary.days[0];

  const pieData = [
    { name: 'Attractions', value: itinerary.cost_breakdown.attractions, color: '#3563E9' },
    { name: 'Dining', value: itinerary.cost_breakdown.food, color: '#20BFA9' },
    { name: 'Transport', value: itinerary.cost_breakdown.transport, color: '#F59E0B' },
    { name: 'Hotel / Stay', value: itinerary.cost_breakdown.accommodation, color: '#8B5CF6' },
  ];

  const handleOpenRecovery = (activity: Activity) => {
    setTargetRecoveryActivity(activity);
    setRecoveryModalOpen(true);
  };

  const handleExecuteRecovery = async () => {
    if (!targetRecoveryActivity || !tripId) return;
    setRecoveryLoading(true);
    setRecoveryNotice(null);
    try {
      const res = await tripsAPI.recoverActivity(
        tripId,
        targetRecoveryActivity.attraction_id,
        recoveryReason
      );
      if (res.success) {
        setItinerary({ ...res.updated_itinerary });
        setGeneratedItinerary({ ...res.updated_itinerary });
        setRecoveryNotice(res.recovery_explanation);
        setRecoveryModalOpen(false);
      } else {
        alert(res.message || 'Recovery failed.');
      }
    } catch (e: any) {
      alert(`Recovery error: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const destInfo = getDestinationById(itinerary.destination?.id || itinerary.destination?.name || 'jaipur');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Trip Overview */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white">
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          <img
            src={destInfo.image}
            alt={destInfo.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal text-white text-[11px] font-bold shadow-sm">
                Personalized Plan
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                {destInfo.state}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white drop-shadow">
              {itinerary.destination?.name || destInfo.name} Itinerary
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal" />
                {itinerary.days.length} Days Planned
              </span>
              <span>•</span>
              <span className="text-gray-300">{destInfo.tagline}</span>
            </p>
          </div>
        </div>

        {/* Bar beneath image */}
        <div className="p-5 sm:p-6 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs text-text-secondary">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Planned Total</span>
              <span className="font-extrabold text-navy-900 text-base font-mono">
                ₹{itinerary.total_estimated_expenditure.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Transit Mode</span>
              <span className="font-bold text-navy-900 capitalize text-sm">
                {itinerary.trip_params?.transport_preference || 'Auto Rickshaw'}
              </span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Pacing</span>
              <span className="font-bold text-navy-900 capitalize text-sm">
                {itinerary.trip_params?.walking_comfort || 'Moderate'}
              </span>
            </div>
          </div>

          <div className="w-full md:w-80 p-3.5 rounded-2xl bg-surface border border-gray-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Budget Utilization</span>
              <span className="font-bold font-mono text-teal">
                {Math.round(itinerary.budget_utilization_percentage)}% utilized
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full ${
                  itinerary.budget_utilization_percentage > 90 ? 'bg-amber-500' : 'bg-teal'
                }`}
                style={{ width: `${Math.min(100, itinerary.budget_utilization_percentage)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>Limit: ₹{Number(itinerary.trip_params?.budget || 20000).toLocaleString('en-IN')}</span>
              <span>Available: ₹{Math.max(0, Number(itinerary.trip_params?.budget || 20000) - itinerary.total_estimated_expenditure).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Success Notification banner */}
      {recoveryNotice && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
            <span><strong>Activity Updated:</strong> {recoveryNotice}</span>
          </div>
          <button
            onClick={() => setRecoveryNotice(null)}
            className="text-gray-400 hover:text-gray-600 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Grid: Days Timeline (Left) & Analytics + Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Day Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
            {itinerary.days.map((d) => (
              <button
                key={d.day_number}
                onClick={() => setActiveDay(d.day_number)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeDay === d.day_number
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-white text-navy-900 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Day {d.day_number}
              </button>
            ))}
          </div>

          {/* Daily Timeline */}
          <div className="space-y-4">
            {currentDayPlan.activities.map((activity, index) => (
              <div key={activity.attraction_id} className="relative pl-6 sm:pl-8 group">
                {/* Vertical timeline line */}
                {index < currentDayPlan.activities.length - 1 && (
                  <div className="absolute left-2.5 sm:left-3 top-8 bottom-0 w-0.5 bg-gray-200 group-hover:bg-primary/40 transition-colors" />
                )}

                {/* Timeline node dot */}
                <div className="absolute left-0.5 sm:left-1 top-3 w-5 h-5 rounded-full bg-white border-2 border-primary flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                </div>

                {/* Activity Card */}
                <Card hover className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded-md bg-primary-50">
                        {activity.time_window}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {activity.slot_label.toUpperCase()}
                      </Badge>
                      <Badge variant="teal" size="sm">
                        {activity.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy-900 font-mono">
                        {activity.entry_fee === 0 ? 'Free Entry' : `₹${activity.entry_fee}`}
                      </span>
                      <button
                        onClick={() => handleOpenRecovery(activity)}
                        title="Replace this activity"
                        className="text-[11px] px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Replace
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-navy-900">{activity.name}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed mt-1">
                      {activity.description}
                    </p>
                  </div>

                  {/* Why we picked this Callout */}
                  <div className="p-3 rounded-xl bg-surface border border-gray-100 text-xs text-gray-600 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy-900">Why we picked this:</strong>{' '}
                      {formatWhyPicked(activity.ai_explanation, activity.category)}
                    </div>
                  </div>

                  {/* Transit to next indicator */}
                  {index < currentDayPlan.activities.length - 1 && (
                    <div className="pt-2 text-[11px] text-gray-400 flex items-center gap-2">
                      <Car className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        ~{activity.transit_from_previous_min} min commute ({activity.distance_from_previous_km} km) via {itinerary.trip_params?.transport_preference || 'auto'}
                      </span>
                    </div>
                  )}
                </Card>
              </div>
            ))}

            {/* Scheduled Meals for the Day */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentDayPlan.meals?.lunch && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between text-amber-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-600" />
                      Scheduled Lunch Stop
                    </span>
                    <span>~₹{currentDayPlan.meals.lunch.avg_cost}</span>
                  </div>
                  <div className="font-semibold text-navy-900">{currentDayPlan.meals.lunch.name}</div>
                  <div className="text-[11px] text-gray-500">{currentDayPlan.meals.lunch.cuisine}</div>
                  <div className="pt-1 flex gap-1">
                    {currentDayPlan.meals.lunch.dietary?.map((diet) => (
                      <span key={diet} className="text-[10px] px-1.5 py-0.5 rounded bg-white text-emerald-700 font-medium border border-emerald-200">
                        {diet.toUpperCase()} Verified
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentDayPlan.meals?.dinner && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between text-indigo-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-indigo-600" />
                      Scheduled Dinner Stop
                    </span>
                    <span>~₹{currentDayPlan.meals.dinner.avg_cost}</span>
                  </div>
                  <div className="font-semibold text-navy-900">{currentDayPlan.meals.dinner.name}</div>
                  <div className="text-[11px] text-gray-500">{currentDayPlan.meals.dinner.cuisine}</div>
                  <div className="pt-1 flex gap-1">
                    {currentDayPlan.meals.dinner.dietary?.map((diet) => (
                      <span key={diet} className="text-[10px] px-1.5 py-0.5 rounded bg-white text-emerald-700 font-medium border border-emerald-200">
                        {diet.toUpperCase()} Verified
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics, Budget Breakdown & Quick Tools */}
        <div className="space-y-6">
          {/* Interactive Geographic Route Map */}
          <InteractiveRouteMap
            activities={currentDayPlan.activities}
            destinationName={itinerary.destination?.name || 'Jaipur'}
            dayNumber={activeDay}
          />

          {/* Quick Actions Card */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-navy-900">Itinerary Tools</h3>
            <div className="space-y-2">
              <Link
                to={`/budget-simulator?tripId=${tripId}`}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-navy-900 hover:bg-gray-50 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal" />
                  Budget What-If Simulator
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </Card>

          {/* Expenditure Breakdown Donut Chart */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-navy-900">Cost Breakdown</h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {pieData.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-gray-500">{p.name}:</span>
                  <span className="font-bold text-navy-900 font-mono">₹{p.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Dynamic Recovery Modal */}
      {recoveryModalOpen && targetRecoveryActivity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-teal">
              <RefreshCw className="w-5 h-5 text-teal" />
              <h3 className="font-bold text-base text-navy-900">Replace Activity</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Target Activity: <strong>{targetRecoveryActivity.name}</strong>.
              We'll find the best available alternative nearby that fits your budget and timing without altering the rest of your trip.
            </p>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                Disruption Event / Reason
              </label>
              <select
                value={recoveryReason}
                onChange={(e) => setRecoveryReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary"
              >
                <option value="Unexpected monument closure">Monument Closed for Renovation</option>
                <option value="Adverse rainy weather">Severe Weather / Rain Affected</option>
                <option value="Excessive waiting queue">Excessive Queue Delay</option>
                <option value="Traveler fatigue / not interested">User Preference Change</option>
              </select>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRecoveryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                loading={recoveryLoading}
                onClick={handleExecuteRecovery}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Find Replacement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

