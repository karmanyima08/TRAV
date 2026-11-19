import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  User,
  Heart,
  DollarSign,
  UtensilsCrossed,
  Footprints,
  Car,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Compass,
  Check,
  Flame,
  Search,
  Landmark,
  Palette,
  Trees,
  Mountain,
  Waves,
  ShoppingBag,
  Leaf,
  Sprout,
  Salad,
  ShieldCheck,
  Navigation,
  Train,
  Clock,
  Award,
  Zap
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
    {
      id: 'historical',
      label: 'Historical Forts & Palaces',
      desc: 'Hilltop fortresses, royal chambers & UNESCO monuments',
      icon: Landmark,
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'cultural',
      label: 'Art & Heritage Museums',
      desc: 'Royal artifact galleries, live folk dance & craft studios',
      icon: Palette,
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'nature',
      label: 'Lakes, Gardens & Nature',
      desc: 'Botanical rose parks, tranquil boat lakes & misty hills',
      icon: Trees,
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'adventure',
      label: 'Treks & Hill Viewpoints',
      desc: 'Himalayan pass viewpoints, paragliding & forest waterfalls',
      icon: Mountain,
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'religious',
      label: 'Spiritual Ghats & Temples',
      desc: 'Vedic evening aarti rituals, ancient gopurams & holy shrines',
      icon: Flame,
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'beach',
      label: 'Coastal Beaches & Watersports',
      desc: 'Golden sand beaches, seaside promenades & ocean sports',
      icon: Waves,
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'food',
      label: 'Street Food & Regional Thali',
      desc: 'Legendary street snacks, royal thalis & heritage cafes',
      icon: UtensilsCrossed,
      image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'shopping',
      label: 'Handicrafts & Local Bazaars',
      desc: 'Textile emporiums, gemstone markets & artisan souvenirs',
      icon: ShoppingBag,
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=600&auto=format&fit=crop&q=80',
    },
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
    { id: 'mountain', label: 'Himalayas & Nature', count: DESTINATIONS_DATA.filter((d) => d.category === 'mountain').length },
    { id: 'beach', label: 'Beaches & Coast', count: DESTINATIONS_DATA.filter((d) => d.category === 'beach').length },
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
                step === 1 ? 'Destination & Dates' :
                step === 2 ? 'Travel Party & Style' :
                step === 3 ? 'Budget Allocation' :
                step === 4 ? 'Activity Interests' :
                step === 5 ? 'Dining & Dietary Preferences' :
                step === 6 ? 'Walking Comfort & Accessibility' :
                step === 7 ? 'Local Transit Mode' : 'Review Your Personalized Trip'
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
                  <span>18 Curated Indian Destinations</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900">
                  Where would you like to travel?
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  Select from 18 destinations across India with authentic photography, verified opening hours, and smart routes.
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white"
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
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
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
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900">
                Travel Party & Style
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Tell us who is traveling so we can balance walking distances, dining atmospheres, and accommodation models.
              </p>
            </div>

            {/* Travel Party Cards with Vector Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  id: 'solo',
                  label: 'Solo Explorer',
                  tag: 'Independent',
                  desc: 'Flexible pacing, spontaneous discoveries & quiet cafes',
                  icon: User,
                  color: 'from-blue-500/10 to-indigo-500/10 text-primary',
                },
                {
                  id: 'couple',
                  label: 'Romantic Couple',
                  tag: 'Scenic & Intimate',
                  desc: 'Sunset view terraces, candlelight dining & heritage walks',
                  icon: Heart,
                  color: 'from-rose-500/10 to-pink-500/10 text-rose-600',
                },
                {
                  id: 'family',
                  label: 'Family with Kids',
                  tag: 'Kid-Friendly & Safe',
                  desc: 'Spaced stops, comfortable AC cabs & easy-access monuments',
                  icon: ShieldCheck,
                  color: 'from-teal-500/10 to-emerald-500/10 text-teal',
                },
                {
                  id: 'group',
                  label: 'Friends Group',
                  tag: 'Action & Thrills',
                  desc: 'Shared adventure sports, lively food streets & night sights',
                  icon: Users,
                  color: 'from-amber-500/10 to-orange-500/10 text-amber-600',
                },
              ].map((t) => {
                const IconComponent = t.icon;
                const active = travelType === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTravelType(t.id)}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between h-56 select-none ${
                      active
                        ? 'border-primary bg-primary-50/60 ring-4 ring-primary/20 shadow-xl scale-[1.02] -translate-y-1'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-inner`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        {active ? (
                          <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md animate-fadeIn">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-gray-400 bg-surface px-2 py-0.5 rounded-md">
                            {t.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-base font-bold text-navy-900">{t.label}</div>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">{t.desc}</div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className={active ? 'text-primary font-bold' : 'text-gray-400'}>
                        {active ? 'Active Selection' : 'Click to select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Party Size Selector */}
            <div className="p-8 rounded-3xl bg-surface border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal block">Party Capacity</span>
                <h3 className="text-xl font-bold font-display text-navy-900 mt-0.5">
                  How many people are traveling in this group?
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Adjusting party size recalculates group transit vehicles, meal reservations, and shared costs.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  className="w-12 h-12 rounded-xl bg-surface hover:bg-gray-200 text-xl font-bold flex items-center justify-center transition-colors text-navy-900"
                >
                  -
                </button>
                <div className="w-16 text-center">
                  <span className="text-2xl font-black text-navy-900 font-mono block">{travelers}</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">{travelers === 1 ? 'Person' : 'People'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTravelers(Math.min(12, travelers + 1))}
                  className="w-12 h-12 rounded-xl bg-primary hover:bg-primary-600 text-white text-xl font-bold flex items-center justify-center transition-colors shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Budget Allocation */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900">
                Total Travel Budget
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Sets the hard upper bound across all activities, dining, and transit without unexpected expenses.
              </p>
            </div>

            {/* Giant Live Budget Display Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal text-xs font-bold border border-white/15">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Total Spending Cap</span>
                </div>
                <div className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white">
                  ₹{budget.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-gray-300">
                  Approx. <strong className="text-teal font-mono text-sm">₹{Math.round(budget / numDays).toLocaleString('en-IN')}</strong> per day for {numDays} days
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 w-full md:w-80 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block">Est. Cost Allocation</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Attractions & Entry</span>
                    <span className="font-bold text-white font-mono">~35% (₹{Math.round(budget * 0.35).toLocaleString('en-IN')})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Dining & Refreshments</span>
                    <span className="font-bold text-white font-mono">~45% (₹{Math.round(budget * 0.45).toLocaleString('en-IN')})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Local Transit</span>
                    <span className="font-bold text-white font-mono">~20% (₹{Math.round(budget * 0.20).toLocaleString('en-IN')})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-3 pt-2">
              <input
                type="range"
                min="5000"
                max="80000"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full accent-primary h-3 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 font-mono">
                <span>₹5,000 (Shoestring)</span>
                <span>₹20,000 (Comfortable Standard)</span>
                <span>₹80,000 (Luxury Palace)</span>
              </div>
            </div>

            {/* Travel Tier Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
              {[
                {
                  id: 'budget',
                  label: 'Budget Explorer',
                  tag: 'Shoestring & Hostels',
                  desc: 'Heritage homestays, walking tours, auto rickshaws & iconic street food.',
                  cost: '₹1,500 – ₹2,500 / day',
                  icon: Compass,
                },
                {
                  id: 'mid',
                  label: 'Comfort & Mid-Range',
                  tag: 'Most Popular',
                  desc: '3-star boutique hotels, AC private cabs, guided monument tours & thali dining.',
                  cost: '₹3,500 – ₹6,000 / day',
                  icon: Award,
                },
                {
                  id: 'luxury',
                  label: 'Luxury Experience',
                  tag: 'Royal Heritage',
                  desc: '5-star royal palace hotels, private chauffeur, fine dining & exclusive sunset cruises.',
                  cost: '₹10,000+ / day',
                  icon: Sparkles,
                },
              ].map((tier) => {
                const IconComponent = tier.icon;
                const active = budgetCategory === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setBudgetCategory(tier.id)}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between h-52 select-none ${
                      active
                        ? 'border-primary bg-primary-50/60 ring-4 ring-primary/20 shadow-xl scale-[1.02] -translate-y-1'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          active ? 'bg-primary text-white' : 'bg-surface text-gray-400'
                        }`}>
                          {tier.tag}
                        </span>
                      </div>
                      <div className="text-base font-bold text-navy-900">{tier.label}</div>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">{tier.desc}</div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-teal">{tier.cost}</span>
                      {active && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Interests */}
        {step === 4 && (
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900">
                Select Activity Interests
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Choose the themes that excite you. The intelligent router will prioritize attractions matching these interests.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {interestOptions.map((inter) => {
                const active = interests.includes(inter.id);
                const IconComponent = inter.icon;
                return (
                  <div
                    key={inter.id}
                    onClick={() => toggleInterest(inter.id)}
                    className={`group relative h-48 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform select-none ${
                      active
                        ? 'ring-4 ring-primary shadow-xl scale-[1.02] -translate-y-1'
                        : 'border border-gray-200 hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Background image */}
                    <img
                      src={inter.image}
                      alt={inter.label}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    {/* Gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t transition-all ${
                        active
                          ? 'from-navy-900/95 via-navy-900/60 to-primary/30'
                          : 'from-black/90 via-black/40 to-black/20 group-hover:via-black/30'
                      }`}
                    />

                    {/* Top Icon & Check */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <div className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {active ? (
                        <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg animate-fadeIn">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-[10px] bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full border border-white/20">
                          Add
                        </span>
                      )}
                    </div>

                    {/* Bottom Title & Description */}
                    <div className="absolute bottom-0 inset-x-0 p-4 z-10 text-white space-y-1">
                      <div className="font-bold text-sm leading-snug drop-shadow">{inter.label}</div>
                      <div className="text-[11px] text-gray-200 line-clamp-2 leading-relaxed drop-shadow">
                        {inter.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Dining & Dietary */}
        {step === 5 && (
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900">
                Dietary & Culinary Preferences
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                We'll strictly suggest dining spots and food walks that respect your dietary lifestyle.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  id: 'veg',
                  label: 'Vegetarian Only',
                  tag: 'Pure Veg Venues',
                  desc: '100% vegetarian kitchens, regional thalis & dairy allowed',
                  icon: Leaf,
                  color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600',
                },
                {
                  id: 'jain',
                  label: 'Jain Friendly',
                  tag: 'Root-Free Dining',
                  desc: 'Strict vegetarian without onions, garlic, potatoes or root veggies',
                  icon: Sprout,
                  color: 'from-amber-500/10 to-yellow-500/10 text-amber-600',
                },
                {
                  id: 'vegan',
                  label: 'Plant-Based Vegan',
                  tag: 'Dairy-Free',
                  desc: 'Exclusively plant-based meals, dairy alternatives & organic bowls',
                  icon: Salad,
                  color: 'from-teal-500/10 to-cyan-500/10 text-teal',
                },
                {
                  id: 'halal',
                  label: 'Halal Certified',
                  tag: 'Verified Compliance',
                  desc: 'Certified halal meat, authentic Mughlai grills & biryani houses',
                  icon: ShieldCheck,
                  color: 'from-indigo-500/10 to-blue-500/10 text-indigo-600',
                },
              ].map((d) => {
                const IconComponent = d.icon;
                const active = dietary.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => toggleDietary(d.id)}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between h-52 select-none ${
                      active
                        ? 'border-teal bg-teal-50/70 ring-4 ring-teal/20 shadow-xl scale-[1.02] -translate-y-1'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${d.color} flex items-center justify-center shadow-inner`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        {active ? (
                          <span className="w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center shadow-md animate-fadeIn">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-gray-400 bg-surface px-2 py-0.5 rounded-md">
                            {d.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-base font-bold text-navy-900">{d.label}</div>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">{d.desc}</div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className={active ? 'text-teal font-bold' : 'text-gray-400'}>
                        {active ? 'Filter Active' : 'Tap to enable'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Walking Stamina */}
        {step === 6 && (
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900">
                Walking Comfort & Physical Pacing
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                We'll pace daily routes and monument visits to match your physical energy level.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  id: 'easy',
                  label: 'Gentle Pacing',
                  gauge: '< 2 km / day',
                  tag: 'Leisurely Tempo',
                  desc: 'Elevator-friendly venues, flat paved courtyards, minimal stair climbing & ample rest breaks.',
                  icon: Footprints,
                },
                {
                  id: 'moderate',
                  label: 'Moderate Explorer',
                  gauge: '2 – 5 km / day',
                  tag: 'Balanced Tempo',
                  desc: 'Heritage palace courtyards, historical bazaar walks, lake promenades & light stairs.',
                  icon: Compass,
                },
                {
                  id: 'active',
                  label: 'High Energy Trekker',
                  gauge: '5+ km / day',
                  tag: 'Active & Adventurous',
                  desc: 'Hilltop fort ramparts, temple peak climbs, high-altitude nature trails & active footsteps.',
                  icon: Zap,
                },
              ].map((w) => {
                const IconComponent = w.icon;
                const active = walkingComfort === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => setWalkingComfort(w.id)}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between h-56 select-none ${
                      active
                        ? 'border-primary bg-primary-50/60 ring-4 ring-primary/20 shadow-xl scale-[1.02] -translate-y-1'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="font-mono text-xs font-bold text-teal bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                          {w.gauge}
                        </span>
                      </div>
                      <div className="text-base font-bold text-navy-900">{w.label}</div>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">{w.desc}</div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-semibold">{w.tag}</span>
                      {active && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Accessibility Checkbox */}
            <div className="p-6 rounded-3xl bg-surface border border-gray-200/80">
              <label className="flex items-center gap-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={accessibility}
                  onChange={(e) => setAccessibility(e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-sm font-bold text-navy-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Require Wheelchair Accessibility & Step-Free Access</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Strictly excludes steep steps, boulder treks, and historic venues lacking verified ramps or elevators.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* STEP 7: Transit Mode */}
        {step === 7 && (
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900">
                Local Transportation Mode
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Used to calculate realistic transit buffers, route sequences, and travel times between daily attractions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  id: 'auto',
                  label: 'Auto Rickshaw',
                  speed: '~25 km/h',
                  tag: 'Local & Authentic',
                  desc: 'Iconic open-air three-wheelers navigating narrow heritage bazaars with ease.',
                  icon: Navigation,
                },
                {
                  id: 'taxi',
                  label: 'AC Cab / Taxi',
                  speed: '~30 km/h',
                  tag: 'Climate Controlled',
                  desc: 'Private air-conditioned ride-hailing for maximum comfort and family groups.',
                  icon: Car,
                },
                {
                  id: 'metro',
                  label: 'City Metro Rail',
                  speed: '~35 km/h',
                  tag: 'Rapid & Punctual',
                  desc: 'Fast rapid-transit avoiding city street traffic (in Delhi, Bengaluru, Kolkata, Jaipur).',
                  icon: Train,
                },
                {
                  id: 'walk',
                  label: 'Scenic Walking',
                  speed: '~5 km/h',
                  tag: 'Pedestrian Stroll',
                  desc: 'Explore dense old-city alleyways, ghat stairways, and local promenades on foot.',
                  icon: Footprints,
                },
              ].map((t) => {
                const IconComponent = t.icon;
                const active = transport === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTransport(t.id)}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between h-52 select-none ${
                      active
                        ? 'border-primary bg-primary-50/60 ring-4 ring-primary/20 shadow-xl scale-[1.02] -translate-y-1'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="font-mono text-xs font-bold text-teal bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          {t.speed}
                        </span>
                      </div>
                      <div className="text-base font-bold text-navy-900">{t.label}</div>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">{t.desc}</div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-semibold">{t.tag}</span>
                      {active && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 8: Review your trip */}
        {step === 8 && (
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-navy-900">
                Review Your Trip Summary
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Everything looks ready! Review your customized itinerary parameters below before we generate your day-by-day plan.
              </p>
            </div>

            {/* Destination Photo Hero Banner in Review */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
              <img
                src={selectedDestinationInfo.image}
                alt={selectedDestinationInfo.name}
                className="w-full h-64 sm:h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal text-white shadow-sm">
                    {selectedDestinationInfo.categoryLabel}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
                    {selectedDestinationInfo.state}
                  </span>
                </div>
                <h3 className="text-3xl sm:text-5xl font-black font-display tracking-tight">
                  {selectedDestinationInfo.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 mt-1.5 max-w-2xl leading-relaxed">
                  {selectedDestinationInfo.tagline}
                </p>
              </div>
            </div>

            {/* Summary Highlights Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-surface border border-gray-200/80">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Duration</span>
                <span className="font-extrabold text-navy-900 text-xl">{numDays} Days</span>
                <span className="text-xs text-gray-500 block mt-0.5">Starts {startDate}</span>
              </div>
              <div className="p-5 rounded-2xl bg-surface border border-gray-200/80">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Planned Budget</span>
                <span className="font-extrabold text-teal text-xl font-mono">₹{budget.toLocaleString('en-IN')}</span>
                <span className="text-xs text-gray-500 block mt-0.5">~₹{Math.round(budget / numDays)} / day</span>
              </div>
              <div className="p-5 rounded-2xl bg-surface border border-gray-200/80">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Party Size</span>
                <span className="font-extrabold text-navy-900 text-xl capitalize">{travelType}</span>
                <span className="text-xs text-gray-500 block mt-0.5">{travelers} Traveler(s)</span>
              </div>
              <div className="p-5 rounded-2xl bg-surface border border-gray-200/80">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Daily Pace</span>
                <span className="font-extrabold text-navy-900 text-xl capitalize">{walkingComfort}</span>
                <span className="text-xs text-gray-500 block mt-0.5">{transport} transit</span>
              </div>
            </div>

            {/* Chosen Interests & Diet */}
            <div className="p-6 rounded-3xl bg-surface border border-gray-200/80 space-y-5">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-2.5">
                  Selected Themes & Interests
                </span>
                <div className="flex flex-wrap gap-2">
                  {interests.map((intId) => {
                    const opt = interestOptions.find((o) => o.id === intId);
                    return (
                      <span
                        key={intId}
                        className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold flex items-center gap-2 border border-primary/20"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {opt ? opt.label : intId}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200/60">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-2.5">
                  Dietary & Accessibility Profile
                </span>
                <div className="flex flex-wrap gap-2">
                  {dietary.map((d) => (
                    <span
                      key={d}
                      className="px-3.5 py-1.5 rounded-xl bg-teal/10 text-teal text-xs font-bold uppercase border border-teal/20"
                    >
                      {d} COMPLIANT
                    </span>
                  ))}
                  {accessibility && (
                    <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
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
              size="lg"
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
              className="bg-primary hover:bg-primary-600 px-8 font-bold"
            >
              Continue to Step {step + 1}
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              loading={loading}
              icon={<Sparkles className="w-5 h-5" />}
              size="lg"
              className="bg-gradient-to-r from-primary via-blue-600 to-teal text-white shadow-xl hover:shadow-2xl px-10 py-3.5 text-base font-extrabold"
            >
              Generate my itinerary
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
