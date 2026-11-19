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
  Compass,
  Check,
  Flame,
  Search
} from 'lucide-react';
import { tripsAPI } from '../services/api';
import { useTrip } from '../context/TripContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DESTINATIONS_DATA, getDestinationById } from '../data/destinations';

export const TripWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    setCurrentTrip,
    setGeneratedItinerary,
    wizardDraft,
    setWizardDraft,
    clearWizardDraft,
  } = useTrip();

  const [step, setStep] = useState<number>(wizardDraft?.step || 1);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form State initialized from persistent draft or query params or defaults
  const [destination, setDestination] = useState<string>(
    searchParams.get('dest') || wizardDraft?.destination || 'jaipur'
  );
  const [startDate, setStartDate] = useState<string>(wizardDraft?.startDate || '2026-12-01');
  const [numDays, setNumDays] = useState<number>(wizardDraft?.numDays || 3);
  const [travelers, setTravelers] = useState<number>(wizardDraft?.travelers || 1);
  const [travelType, setTravelType] = useState<string>(wizardDraft?.travelType || 'solo');
  const [budget, setBudget] = useState<number>(wizardDraft?.budget || 20000);
  const [budgetCategory, setBudgetCategory] = useState<string>(wizardDraft?.budgetCategory || 'mid');
  const [interests, setInterests] = useState<string[]>(
    wizardDraft?.interests || ['historical', 'cultural']
  );
  const [dietary, setDietary] = useState<string[]>(wizardDraft?.dietary || ['veg']);
  const [walkingComfort, setWalkingComfort] = useState<string>(
    wizardDraft?.walkingComfort || 'moderate'
  );
  const [accessibility, setAccessibility] = useState<boolean>(
    wizardDraft?.accessibility ?? false
  );
  const [transport, setTransport] = useState<string>(wizardDraft?.transport || 'auto');
  const [algorithm] = useState<string>('astar');

  // Auto-sync draft to persistent storage whenever form or step changes
  React.useEffect(() => {
    setWizardDraft({
      destination,
      startDate,
      numDays,
      travelers,
      travelType,
      budget,
      budgetCategory,
      interests,
      dietary,
      walkingComfort,
      accessibility,
      transport,
      step,
    });
  }, [
    destination,
    startDate,
    numDays,
    travelers,
    travelType,
    budget,
    budgetCategory,
    interests,
    dietary,
    walkingComfort,
    accessibility,
    transport,
    step,
  ]);

  const handleStartOver = () => {
    if (window.confirm('Reset all trip planning details and start over?')) {
      clearWizardDraft();
      setStep(1);
      setDestination('jaipur');
      setStartDate('2026-12-01');
      setNumDays(3);
      setTravelers(1);
      setTravelType('solo');
      setBudget(20000);
      setBudgetCategory('mid');
      setInterests(['historical', 'cultural']);
      setDietary(['veg']);
      setWalkingComfort('moderate');
      setAccessibility(false);
      setTransport('auto');
    }
  };

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

  const filteredDestinations = DESTINATIONS_DATA.filter((d) => {
    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
    const matchesQuery =
      searchQuery.trim() === '' ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const selectedDestinationInfo = getDestinationById(destination);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const tripPayload = {
        title: `Trip to ${selectedDestinationInfo.name} (${numDays} Days)`,
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

      // Trigger Itinerary Generation Pipeline
      const itinerary = await tripsAPI.generateItinerary(createdTrip.id);
      setGeneratedItinerary(itinerary);
      clearWizardDraft();

      navigate(`/itinerary/${createdTrip.id}`);
    } catch (err: any) {
      alert(`Error generating itinerary: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Destinations', count: DESTINATIONS_DATA.length },
    { id: 'heritage', label: 'Royal Heritage', count: DESTINATIONS_DATA.filter((d) => d.category === 'heritage').length },
    { id: 'beach', label: 'Beaches & Coast', count: DESTINATIONS_DATA.filter((d) => d.category === 'beach').length },
    { id: 'mountain', label: 'Himalayas & Nature', count: DESTINATIONS_DATA.filter((d) => d.category === 'mountain').length },
    { id: 'spiritual', label: 'Spiritual & Sacred', count: DESTINATIONS_DATA.filter((d) => d.category === 'spiritual').length },
    { id: 'urban', label: 'Metropolitan & Culture', count: DESTINATIONS_DATA.filter((d) => d.category === 'urban').length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-text-secondary mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-bold text-navy-900">
              Step {step} of 8: {
                step === 1 ? 'Choose Destination & Dates' :
                step === 2 ? 'Travel Party & Style' :
                step === 3 ? 'Budget Allocation' :
                step === 4 ? 'Activity Interests' :
                step === 5 ? 'Dining & Dietary' :
                step === 6 ? 'Walking Comfort & Accessibility' :
                step === 7 ? 'Transit Mode' : 'Review Your Personalized Trip'
              }
            </span>
            <span className="text-[11px] text-teal bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              Draft saved
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleStartOver}
              className="text-xs text-text-secondary hover:text-red-500 underline transition-colors"
            >
              Start over
            </button>
            <span className="text-primary font-bold text-xs sm:text-sm">{Math.round((step / 8) * 100)}% Complete</span>
          </div>
        </div>
        <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-primary via-blue-500 to-teal transition-all duration-300"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-6 sm:p-10 lg:p-12 shadow-2xl border-gray-100/80 rounded-3xl bg-white/95 backdrop-blur-sm">
        {/* STEP 1: Destination & Dates */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Curated Indian Destinations</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900">
                  Where would you like to travel?
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  Select from 12 iconic destinations across India with authentic photos, verified opening hours, and smart routes.
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search city, state or theme..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-navy-900 text-white shadow-md'
                      : 'bg-surface hover:bg-gray-200/70 text-text-secondary'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            {/* Destination Photo Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredDestinations.map((opt) => {
                const isSelected = destination === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setDestination(opt.id)}
                    className={`group relative h-72 sm:h-80 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform select-none ${
                      isSelected
                        ? 'ring-4 ring-teal shadow-2xl scale-[1.02] -translate-y-1'
                        : 'border border-gray-200 hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    {/* Background Image */}
                    <img
                      src={opt.image}
                      alt={opt.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t transition-all duration-300 ${
                        isSelected
                          ? 'from-black/95 via-black/50 to-teal/30'
                          : 'from-black/90 via-black/40 to-black/20 group-hover:via-black/30'
                      }`}
                    />

                    {/* Top Chips Row */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                      <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                        {opt.state}
                      </span>
                      {isSelected ? (
                        <span className="px-2.5 py-1 rounded-full bg-teal text-white text-[11px] font-bold flex items-center gap-1 shadow-lg animate-fadeIn">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Selected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-medium border border-white/20">
                          {opt.bestSeason}
                        </span>
                      )}
                    </div>

                    {/* Bottom Content Row */}
                    <div className="absolute bottom-0 inset-x-0 p-4 z-10 text-white space-y-2">
                      <div>
                        <div className="text-xl sm:text-2xl font-bold font-display drop-shadow-md">
                          {opt.name}
                        </div>
                        <p className="text-[11px] text-gray-200 line-clamp-1 mt-0.5 drop-shadow">
                          {opt.tagline}
                        </p>
                      </div>

                      {/* Top Highlights Chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {opt.highlights.slice(0, 2).map((h, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md text-gray-100"
                          >
                            {h}
                          </span>
                        ))}
                      </div>

                      {/* Daily Budget Badge */}
                      <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-semibold text-gray-300">Est. Daily</span>
                        <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-500/30">
                          {opt.avgCost}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Travel Dates & Duration Controls */}
            <div className="p-6 rounded-2xl bg-surface border border-gray-200/80 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Start Date of Your Journey</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-navy-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                />
                <span className="text-[11px] text-text-secondary mt-1 block">
                  Used to verify venue opening schedules and day-of-week closures.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-teal" />
                    <span>Trip Duration</span>
                  </label>
                  <span className="font-extrabold text-sm text-primary px-3 py-1 rounded-full bg-primary/10">
                    {numDays} {numDays === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={numDays}
                  onChange={(e) => setNumDays(parseInt(e.target.value))}
                  className="w-full accent-primary h-2 bg-gray-200 rounded-lg cursor-pointer mt-3"
                />
                <div className="flex justify-between text-xs font-mono text-gray-400 mt-2">
                  <span>1 Day (Express)</span>
                  <span>3 Days (Standard)</span>
                  <span>7 Days (Full Explorer)</span>
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'solo', label: 'Solo Traveler', icon: '👤', desc: 'Independent pace & flexible stops' },
                { id: 'couple', label: 'Couple', icon: '👥', desc: 'Scenic dining & romantic viewpoints' },
                { id: 'family', label: 'Family with Kids', icon: '👨‍👩‍👧', desc: 'Comfortable transit & kid-friendly sites' },
                { id: 'group', label: 'Friends Group', icon: '🎉', desc: 'Action-packed & shared experiences' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTravelType(t.id)}
                  className={`p-5 rounded-2xl border text-center cursor-pointer transition-all ${
                    travelType === t.id
                      ? 'border-primary bg-primary-50/60 ring-2 ring-primary/20 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{t.icon}</div>
                  <div className="text-sm font-bold text-navy-900">{t.label}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{t.desc}</div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-gray-200/80 mt-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-3">
                Number of Travelers: <span className="text-primary font-mono text-base">{travelers}</span>
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  className="w-12 h-12 rounded-xl border border-gray-300 text-xl font-bold flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="text-2xl font-black text-navy-900 font-mono w-12 text-center">{travelers}</span>
                <button
                  type="button"
                  onClick={() => setTravelers(Math.min(10, travelers + 1))}
                  className="w-12 h-12 rounded-xl border border-gray-300 text-xl font-bold flex items-center justify-center hover:bg-gray-100 transition-colors"
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
                Sets the overall spending limit across activities, dining, and transit.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-surface to-teal-50/40 border border-teal-200/80 text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal">Estimated Total Spending Limit</span>
              <div className="text-5xl font-black font-display text-navy-900">
                ₹{budget.toLocaleString('en-IN')}
              </div>
              <p className="text-sm text-gray-600 font-medium">
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
              className="w-full accent-primary h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 font-mono">
              <span>₹5,000 (Shoestring)</span>
              <span>₹20,000 (Comfortable)</span>
              <span>₹80,000 (Luxury)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {[
                { id: 'budget', label: 'Budget Traveler', sub: 'Homestays, public transit & authentic local eats' },
                { id: 'mid', label: 'Comfort / Mid-Range', sub: '3-star hotels, AC cabs & popular heritage dining' },
                { id: 'luxury', label: 'Luxury Experience', sub: 'Heritage palace stays, fine dining & private car' },
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setBudgetCategory(tier.id)}
                  className={`p-5 rounded-2xl border text-center cursor-pointer transition-all ${
                    budgetCategory === tier.id
                      ? 'border-primary bg-primary-50/60 ring-2 ring-primary/20 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-bold text-navy-900">{tier.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{tier.sub}</div>
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
                We'll prioritize attractions and experiences that match what you enjoy most.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {interestOptions.map((inter) => {
                const active = interests.includes(inter.id);
                return (
                  <div
                    key={inter.id}
                    onClick={() => toggleInterest(inter.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-28 ${
                      active
                        ? 'border-primary bg-primary text-white shadow-md scale-[1.02]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-navy-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold leading-snug">{inter.label}</span>
                      {active && <Check className="w-4 h-4 text-white shrink-0" />}
                    </div>
                    <span className={`text-[10px] ${active ? 'text-white/80' : 'text-gray-400'}`}>
                      {active ? 'Selected' : 'Tap to add'}
                    </span>
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
                We'll only suggest dining options that fit your food preferences and diet.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'veg', label: 'Vegetarian Only', desc: 'No meat, fish or poultry' },
                { id: 'jain', label: 'Jain (Root-Free)', desc: 'Strict vegetarian without root veggies' },
                { id: 'vegan', label: 'Plant-Based Vegan', desc: '100% dairy-free plant foods' },
                { id: 'halal', label: 'Halal Certified', desc: 'Compliant culinary venues' },
              ].map((d) => {
                const active = dietary.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => toggleDietary(d.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      active
                        ? 'border-teal bg-teal text-white shadow-md scale-[1.02]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-navy-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-sm font-bold">{d.label}</div>
                      {active && <Check className="w-4 h-4 text-white shrink-0" />}
                    </div>
                    <div className={`text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>{d.desc}</div>
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
                We'll pace each day's walking to match your energy level and comfort.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'easy', label: 'Gentle Pacing', desc: 'Under 2 km/day, elevator friendly, minimal stairs' },
                { id: 'moderate', label: 'Moderate Explorer', desc: '2 - 5 km/day, palace courtyards & garden strolls' },
                { id: 'active', label: 'High Energy Trekker', desc: '5+ km/day, hilltop fort ramparts & active steps' },
              ].map((w) => (
                <div
                  key={w.id}
                  onClick={() => setWalkingComfort(w.id)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                    walkingComfort === w.id
                      ? 'border-primary bg-primary-50/60 ring-2 ring-primary/20 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-base font-bold text-navy-900 mb-1">{w.label}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{w.desc}</div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 p-5 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={accessibility}
                  onChange={(e) => setAccessibility(e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <div>
                  <div className="text-sm font-bold text-navy-900">Require Wheelchair Accessibility</div>
                  <div className="text-xs text-gray-500">Only selects attractions with verified ramps or step-free access.</div>
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
                Used to calculate travel times and routes between activities.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'auto', label: 'Auto Rickshaw', desc: '~25 km/h, authentic local feeling' },
                { id: 'taxi', label: 'AC Cab / Taxi', desc: '~30 km/h, air-conditioned comfort' },
                { id: 'metro', label: 'City Metro', desc: '~35 km/h, rapid rapid transit' },
                { id: 'walk', label: 'Walking / Foot', desc: '~5 km/h, dense historic alleys' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTransport(t.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    transport === t.id
                      ? 'border-primary bg-primary-50/60 ring-2 ring-primary/20 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-bold text-navy-900 mb-1">{t.label}</div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 8: Review your trip */}
        {step === 8 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-navy-900">Review your trip</h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Everything looks ready! Review your trip summary below before we create your itinerary.
              </p>
            </div>

            {/* Destination Photo Hero Banner in Review */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-200">
              <img
                src={selectedDestinationInfo.image}
                alt={selectedDestinationInfo.name}
                className="w-full h-56 sm:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md w-fit border border-white/20 mb-1">
                  {selectedDestinationInfo.state}
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold font-display">
                  {selectedDestinationInfo.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 mt-1 max-w-xl">
                  {selectedDestinationInfo.tagline}
                </p>
              </div>
            </div>

            {/* Summary Highlights Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-surface border border-gray-200/80">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Duration</span>
                <span className="font-extrabold text-navy-900 text-lg">{numDays} Days</span>
                <span className="text-[11px] text-gray-500 block mt-0.5">Starts {startDate}</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-gray-200/80">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Planned Budget</span>
                <span className="font-extrabold text-teal text-lg">₹{budget.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-gray-500 block mt-0.5">~₹{Math.round(budget/numDays)}/day</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-gray-200/80">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Party Size</span>
                <span className="font-extrabold text-navy-900 text-lg capitalize">{travelType}</span>
                <span className="text-[11px] text-gray-500 block mt-0.5">{travelers} Traveler(s)</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-gray-200/80">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Daily Pace</span>
                <span className="font-extrabold text-navy-900 text-lg capitalize">{walkingComfort}</span>
                <span className="text-[11px] text-gray-500 block mt-0.5">{transport} transit</span>
              </div>
            </div>

            {/* Chosen Interests & Diet */}
            <div className="p-6 rounded-2xl bg-surface border border-gray-200/80 space-y-4">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-2">Selected Interests</span>
                <div className="flex flex-wrap gap-2">
                  {interests.map((intId) => {
                    const opt = interestOptions.find((o) => o.id === intId);
                    return (
                      <span
                        key={intId}
                        className="px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold"
                      >
                        {opt ? opt.label : intId}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200/60">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-2">Dietary Preferences</span>
                <div className="flex flex-wrap gap-2">
                  {dietary.map((d) => (
                    <span
                      key={d}
                      className="px-3.5 py-1.5 rounded-full bg-teal/10 text-teal text-xs font-bold uppercase"
                    >
                      {d}
                    </span>
                  ))}
                  {accessibility && (
                    <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                      Wheelchair Accessible Only
                    </span>
                  )}
                </div>
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
              size="lg"
              className="bg-primary hover:bg-primary-600 px-8"
            >
              Continue to Step {step + 1}
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              loading={loading}
              icon={<Sparkles className="w-5 h-5" />}
              size="lg"
              className="bg-gradient-to-r from-primary via-blue-600 to-teal text-white shadow-xl hover:shadow-2xl px-10 py-3 text-base font-bold"
            >
              Generate my itinerary
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
