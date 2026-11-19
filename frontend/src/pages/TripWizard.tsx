import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Heart,
  Utensils,
  Footprints,
  Car,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Bot
} from 'lucide-react';
import { tripsAPI } from '../services/api';
import { useTrip } from '../context/TripContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const TripWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentTrip, setGeneratedItinerary } = useTrip();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Form State
  const [destination, setDestination] = useState<string>(searchParams.get('dest') || 'jaipur');
  const [startDate, setStartDate] = useState<string>('2026-12-01');
  const [numDays, setNumDays] = useState<number>(3);
  const [travelers, setTravelers] = useState<number>(1);
  const [travelType, setTravelType] = useState<string>('solo');
  const [budget, setBudget] = useState<number>(20000);
  const [budgetCategory, setBudgetCategory] = useState<string>('mid');
  const [interests, setInterests] = useState<string[]>(['historical', 'cultural']);
  const [dietary, setDietary] = useState<string[]>(['veg']);
  const [walkingComfort, setWalkingComfort] = useState<string>('moderate');
  const [accessibility, setAccessibility] = useState<boolean>(false);
  const [transport, setTransport] = useState<string>('auto');
  const [algorithm, setAlgorithm] = useState<string>('astar');

  const destinationOptions = [
    { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', desc: 'Forts, Palaces, Bazaars' },
    { id: 'delhi', name: 'Delhi NCR', state: 'Capital', desc: 'Mughal Heritage & Metro' },
    { id: 'goa', name: 'Goa Coast', state: 'Goa', desc: 'Beaches & Latin Quarter' },
    { id: 'agra', name: 'Agra', state: 'Uttar Pradesh', desc: 'Taj Mahal & Citadel' },
    { id: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', desc: 'Ghats & Ancient Temples' },
    { id: 'udaipur', name: 'Udaipur', state: 'Rajasthan', desc: 'Lake Pichola & Palaces' },
  ];

  const interestOptions = [
    { id: 'historical', label: 'Historical Forts & Palaces' },
    { id: 'cultural', label: 'Art & Heritage Museums' },
    { id: 'nature', label: 'Lakes, Gardens & Nature' },
    { id: 'adventure', label: 'Treks & Hill Viewpoints' },
    { id: 'religious', label: 'Spiritual Ghats & Temples' },
    { id: 'beach', label: 'Coastal Beaches & Watersports' },
    { id: 'food', label: 'Street Food & Regional Thali' },
    { id: 'shopping', label: 'Handicrafts & Local Bazaars' },
  ];

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      if (interests.length > 1) setInterests(interests.filter((i) => i !== id));
    } else {
      setInterests([...interests, id]);
    }
  };

  const toggleDietary = (id: string) => {
    if (dietary.includes(id)) {
      setDietary(dietary.filter((d) => d !== id));
    } else {
      setDietary([...dietary, id]);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const tripPayload = {
        title: `Trip to ${destination.toUpperCase()} (${numDays} Days)`,
        destination,
        start_date: startDate,
        num_days: numDays,
        num_travelers: travelers,
        travel_type: travelType,
        budget,
        budget_category: budgetCategory,
        interests,
        dietary_restrictions: dietary,
        walking_comfort: walkingComfort,
        accessibility_required: accessibility,
        transport_preference: transport,
        search_algorithm: algorithm,
      };

      const createdTrip = await tripsAPI.create(tripPayload);
      setCurrentTrip(createdTrip);

      // Trigger AI Pipeline
      const itinerary = await tripsAPI.generateItinerary(createdTrip.id);
      setGeneratedItinerary(itinerary);

      navigate(`/itinerary/${createdTrip.id}`);
    } catch (err: any) {
      alert(`Error running AI pipeline: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Wizard Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between text-xs font-semibold text-text-secondary mb-2">
          <span>Step {step} of 8: {
            step === 1 ? 'Destination & Dates' :
            step === 2 ? 'Travel Party' :
            step === 3 ? 'Budget Allocation' :
            step === 4 ? 'Activity Interests' :
            step === 5 ? 'Dining & Dietary' :
            step === 6 ? 'Walking Stamina' :
            step === 7 ? 'Transit Mode' : 'AI Engine Formulation'
          }</span>
          <span className="text-primary font-bold">{Math.round((step / 8) * 100)}% Complete</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-teal transition-all duration-300"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-6 sm:p-10 shadow-xl border-gray-100">
        {/* STEP 1: Destination & Dates */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900">Choose Your Destination</h2>
              <p className="text-xs text-text-secondary mt-1">Select from verified knowledge-base seeded cities.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {destinationOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setDestination(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    destination === opt.id
                      ? 'border-primary bg-primary-50/60 ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-sm text-navy-900">{opt.name}</div>
                  <div className="text-xs text-primary font-medium">{opt.state}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{opt.desc}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                  Trip Duration ({numDays} Days)
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={numDays}
                  onChange={(e) => setNumDays(parseInt(e.target.value))}
                  className="w-full accent-primary mt-2"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>1 Day</span>
                  <span>3 Days</span>
                  <span>7 Days</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Travelers */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900">Travel Party & Group Type</h2>
              <p className="text-xs text-text-secondary mt-1">Defines preference weighting and accommodation models.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'solo', label: 'Solo Traveler', icon: '👤' },
                { id: 'couple', label: 'Couple', icon: '👥' },
                { id: 'family', label: 'Family with Kids', icon: '👨‍👩‍👧' },
                { id: 'group', label: 'Friends Group', icon: '🎉' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTravelType(t.id)}
                  className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                    travelType === t.id
                      ? 'border-primary bg-primary-50/60 ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <div className="text-xs font-bold text-navy-900">{t.label}</div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-2">
                Number of Travelers: {travelers}
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  className="w-10 h-10 rounded-xl border border-gray-300 text-lg font-bold flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <span className="text-lg font-bold text-navy-900 font-mono w-6 text-center">{travelers}</span>
                <button
                  type="button"
                  onClick={() => setTravelers(Math.min(10, travelers + 1))}
                  className="w-10 h-10 rounded-xl border border-gray-300 text-lg font-bold flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Budget Allocation */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900">Total Travel Budget</h2>
              <p className="text-xs text-text-secondary mt-1">
                Used by CSP solver as a hard upper bound across activities, dining, and transit.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-gray-200/80 text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal">Estimated Budget</span>
              <div className="text-4xl font-black font-display text-navy-900">
                ₹{budget.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-gray-500">
                ~₹{Math.round(budget / numDays).toLocaleString('en-IN')} per day for {numDays} days
              </p>
            </div>

            <input
              type="range"
              min="5000"
              max="80000"
              step="1000"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-400 font-mono">
              <span>₹5,000 (Shoestring)</span>
              <span>₹20,000 (Standard)</span>
              <span>₹80,000 (Luxury)</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { id: 'budget', label: 'Budget Traveler', sub: 'Hostels & street eats' },
                { id: 'mid', label: 'Comfort / Mid-Range', sub: '3-star hotels & cabs' },
                { id: 'luxury', label: 'Luxury Experience', sub: 'Palace stays & private tours' },
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setBudgetCategory(tier.id)}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                    budgetCategory === tier.id
                      ? 'border-primary bg-primary-50/60 ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs font-bold text-navy-900">{tier.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{tier.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Interests */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900">Select Activity Interests</h2>
              <p className="text-xs text-text-secondary mt-1">
                Forward chaining rules match interests to boost attraction suitability scores.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {interestOptions.map((inter) => {
                const active = interests.includes(inter.id);
                return (
                  <div
                    key={inter.id}
                    onClick={() => toggleInterest(inter.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      active
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-navy-900'
                    }`}
                  >
                    <div className="text-xs font-bold leading-snug">{inter.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Dining & Dietary */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900">Dietary Restrictions & Dining</h2>
              <p className="text-xs text-text-secondary mt-1">
                Strict CSP rules exclude non-compliant restaurants (e.g. Jain, Pure Veg, Halal).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'veg', label: 'Vegetarian Only' },
                { id: 'jain', label: 'Jain (Root-Free)' },
                { id: 'vegan', label: 'Plant-Based Vegan' },
                { id: 'halal', label: 'Halal Certified' },
              ].map((d) => {
                const active = dietary.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => toggleDietary(d.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      active
                        ? 'border-teal bg-teal text-white shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-navy-900'
                    }`}
                  >
                    <div className="text-xs font-bold leading-snug">{d.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Walking Stamina */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900">Physical Comfort & Accessibility</h2>
              <p className="text-xs text-text-secondary mt-1">
                CSP limits consecutive walking tours based on daily physical fatigue thresholds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'easy', label: 'Gentle Pacing', desc: 'Under 2 km/day, elevator friendly, minimal stairs' },
                { id: 'moderate', label: 'Moderate Explorer', desc: '2 - 5 km/day, palace courtyards & garden strolls' },
                { id: 'active', label: 'High Energy Trekker', desc: '5+ km/day, hilltop fort ramparts & active steps' },
              ].map((w) => (
                <div
                  key={w.id}
                  onClick={() => setWalkingComfort(w.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    walkingComfort === w.id
                      ? 'border-primary bg-primary-50/60 ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-bold text-navy-900 mb-1">{w.label}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{w.desc}</div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={accessibility}
                  onChange={(e) => setAccessibility(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <div>
                  <div className="text-xs font-bold text-navy-900">Require Wheelchair Accessibility</div>
                  <div className="text-[11px] text-gray-500">Prunes all attractions lacking verified ramps or step-free access.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* STEP 7: Transit Mode */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900">Local Transportation Preference</h2>
              <p className="text-xs text-text-secondary mt-1">
                Used to compute transit travel times and step costs in state-space search.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'auto', label: 'Auto Rickshaw', desc: '~25 km/h, authentic local' },
                { id: 'taxi', label: 'AC Cab / Taxi', desc: '~30 km/h, comfortable' },
                { id: 'metro', label: 'City Metro', desc: '~35 km/h, rapid transit' },
                { id: 'walk', label: 'Walking / Foot', desc: '~5 km/h, dense old city' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTransport(t.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    transport === t.id
                      ? 'border-primary bg-primary-50/60 ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs font-bold text-navy-900 mb-1">{t.label}</div>
                  <div className="text-[11px] text-gray-500">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 8: Review & AI Algorithm Selector */}
        {step === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900">Review & AI Algorithm Selection</h2>
              <p className="text-xs text-text-secondary mt-1">
                Choose the State Space Search algorithm to execute on your problem formulation.
              </p>
            </div>

            {/* Summary Chips */}
            <div className="p-4 rounded-2xl bg-surface border border-gray-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Destination</span>
                <span className="font-bold text-navy-900 capitalize">{destination}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Duration</span>
                <span className="font-bold text-navy-900">{numDays} Days</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Budget</span>
                <span className="font-bold text-teal">₹{budget.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Stamina</span>
                <span className="font-bold text-navy-900 capitalize">{walkingComfort}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-2">
                Primary Search Algorithm (Course Topic 2)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'astar',
                    name: 'A* Search (Recommended)',
                    desc: 'Optimal pathfinding with admissible heuristic f(n) = g(n) + h(n)',
                    badge: 'Admissible & Optimal'
                  },
                  {
                    id: 'greedy',
                    name: 'Greedy Best-First Search',
                    desc: 'Prioritizes immediate minimum heuristic h(n) estimate',
                    badge: 'Heuristic Only'
                  },
                  {
                    id: 'ucs',
                    name: 'Uniform Cost Search (Dijkstra)',
                    desc: 'Expands strictly lowest accumulated path cost g(n)',
                    badge: 'Optimal Uninformed'
                  },
                  {
                    id: 'bfs',
                    name: 'Breadth-First Search (BFS)',
                    desc: 'Level-by-level queue exploration for shortest hop count',
                    badge: 'Unweighted'
                  },
                ].map((algo) => (
                  <div
                    key={algo.id}
                    onClick={() => setAlgorithm(algo.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      algorithm === algo.id
                        ? 'border-primary bg-primary-50/60 ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-navy-900">{algo.name}</span>
                      <Badge variant="primary" size="sm">{algo.badge}</Badge>
                    </div>
                    <div className="text-[11px] text-gray-500">{algo.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={() => setStep(step - 1)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 8 ? (
            <Button
              onClick={() => setStep(step + 1)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              loading={loading}
              icon={<Sparkles className="w-4 h-4" />}
              className="bg-gradient-to-r from-primary to-teal text-white shadow-lg"
            >
              Generate AI Itinerary
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

