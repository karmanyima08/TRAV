import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Sliders,
  Users,
  CheckCircle,
  Star,
  Layers,
  Activity,
  Heart,
  Navigation,
  CalendarCheck
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Landing: React.FC = () => {
  const featuredDestinations = [
    {
      id: 'jaipur',
      name: 'Jaipur',
      state: 'Rajasthan',
      tagline: 'Palaces, hill forts, and royal heritage',
      cost: '₹2,000 / day',
      color: 'from-amber-500/20 to-rose-500/20',
      badge: 'Trending Heritage'
    },
    {
      id: 'goa',
      name: 'Goa',
      state: 'Goa Coast',
      tagline: 'Sun-drenched beaches & Portuguese architecture',
      cost: '₹2,500 / day',
      color: 'from-cyan-500/20 to-teal/20',
      badge: 'Coastal Getaway'
    },
    {
      id: 'delhi',
      name: 'Delhi NCR',
      state: 'Capital Region',
      tagline: 'Mughal monuments, world cuisine & metro',
      cost: '₹2,200 / day',
      color: 'from-blue-500/20 to-indigo-500/20',
      badge: 'Urban Culture'
    },
    {
      id: 'agra',
      name: 'Agra',
      state: 'Uttar Pradesh',
      tagline: 'Home to the Taj Mahal & Mughal wonders',
      cost: '₹1,800 / day',
      color: 'from-rose-500/20 to-purple-500/20',
      badge: 'World Wonder'
    },
    {
      id: 'varanasi',
      name: 'Varanasi',
      state: 'Uttar Pradesh',
      tagline: 'Spiritual Ganga ghats & ancient sacred temples',
      cost: '₹1,500 / day',
      color: 'from-orange-500/20 to-amber-500/20',
      badge: 'Spiritual Soul'
    },
    {
      id: 'udaipur',
      name: 'Udaipur',
      state: 'Rajasthan',
      tagline: 'City of Lakes and marble island palaces',
      cost: '₹2,200 / day',
      color: 'from-teal/20 to-emerald-500/20',
      badge: 'Romantic Lakes'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-navy-900 via-navy-900 to-navy-800 text-white">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#3563E9_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/90 border border-navy-700 text-xs font-semibold text-teal shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Travel Planning</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
              Personalized, Constraint-Aware <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal via-primary-200 to-primary">
                Travel Planning
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed max-w-2xl mx-auto">
              Replace dozens of scattered browser tabs with effortless, intelligent trip planning.
              Designed around your real budget, daily rhythm, and unique travel style.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/plan"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-600 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
              >
                Plan My Trip
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick highlights */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto border-t border-navy-800/80">
              <div className="text-center">
                <div className="text-xl font-extrabold text-white">10 Cities</div>
                <div className="text-xs text-gray-400">Curated Indian Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-extrabold text-teal">Smart Routes</div>
                <div className="text-xs text-gray-400">Zero Schedule Overlaps</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-extrabold text-white">Diet & Budget</div>
                <div className="text-xs text-gray-400">Pure Veg, Jain & Halal</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-extrabold text-blue-400">Dynamic Backup</div>
                <div className="text-xs text-gray-400">Instant Spot Replacements</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <Badge variant="primary" size="md">How It Works</Badge>
          <h2 className="text-3xl font-bold font-display text-navy-900">
            How TRAVORA Builds Your Trip
          </h2>
          <p className="text-sm text-text-secondary">
            Every itinerary is built to respect real opening hours, practical transit times, and your spending limit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {[
            {
              step: '01',
              title: 'Specify Preferences',
              desc: 'Enter destination, travel days, total budget, walking stamina, dietary restrictions, and interest profile.',
              icon: Sliders
            },
            {
              step: '02',
              title: 'Route Optimization',
              desc: 'Discovers the most convenient visit order minimizing commute time and travel fatigue.',
              icon: Navigation
            },
            {
              step: '03',
              title: 'Schedule Validation',
              desc: 'Verifies operating hours, transit buffers, and meal breaks so there are zero conflicts.',
              icon: CalendarCheck
            },
            {
              step: '04',
              title: 'Adaptive Itinerary',
              desc: 'View your day-by-day plan, simulate budget adjustments, or replace closed spots on the fly.',
              icon: Activity
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-primary/40">{item.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-bold text-base text-navy-900 mb-2">{item.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="bg-surface py-16 border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <Badge variant="teal" size="md">Key Features</Badge>
            <h2 className="text-3xl font-bold font-display text-navy-900">
              Built for Real-World Travel
            </h2>
            <p className="text-sm text-text-secondary">
              Everything you need for smooth, stress-free travel planning from start to finish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hover className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary">ROUTE OPTIMIZER</span>
                <Badge variant="primary" size="sm">Smart Pacing</Badge>
              </div>
              <h3 className="font-bold text-base text-navy-900">Geographic Route Sequencing</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Groups neighboring attractions into logical daily sequences to eliminate unnecessary commuting and cut down transit costs.
              </p>
            </Card>

            <Card hover className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-teal">SCHEDULE ACCURACY</span>
                <Badge variant="teal" size="sm">No Overlaps</Badge>
              </div>
              <h3 className="font-bold text-base text-navy-900">Opening Hours & Time Windows</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Schedules morning, afternoon, and evening slots with verified opening times, visit durations, and comfortable meal stops.
              </p>
            </Card>

            <Card hover className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-500">CURATED PICKS</span>
                <Badge variant="primary" size="sm">Personalized</Badge>
              </div>
              <h3 className="font-bold text-base text-navy-900">Interest & Diet Customization</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Matches sights, activities, and dining spots directly to your passions, whether you're into heritage, food trails, or nature.
              </p>
            </Card>

            <Card hover className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-600">SMART BUDGET</span>
                <Badge variant="purple" size="sm">Transparency</Badge>
              </div>
              <h3 className="font-bold text-base text-navy-900">Interactive Budget Simulator</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Adjust your travel budget with a live slider to see immediate reallocations across hotels, dining, and activities.
              </p>
            </Card>

            <Card hover className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-600">FLEXIBLE</span>
                <Badge variant="warning" size="sm">One-Click Swap</Badge>
              </div>
              <h3 className="font-bold text-base text-navy-900">Instant Spot Replacements</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                When a monument is unexpectedly closed or rained out, find an optimal nearby replacement without disrupting the rest of your trip.
              </p>
            </Card>

            <Card hover className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-600">COLLABORATION</span>
                <Badge variant="teal" size="sm">Group Harmony</Badge>
              </div>
              <h3 className="font-bold text-base text-navy-900">Group Trip Planner</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Balances conflicting group member interests and budgets so everyone gets to experience what they love most.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <Badge variant="primary" size="md">Curated Destinations</Badge>
            <h2 className="text-3xl font-bold font-display text-navy-900 mt-2">
              Explore Popular Indian Cities
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Complete guides with verified operating hours, ticket fees, and travel times.
            </p>
          </div>
          <Link
            to="/plan"
            className="text-xs font-bold text-primary hover:text-primary-600 flex items-center gap-1.5"
          >
            Start custom trip <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.map((dest) => (
            <Card key={dest.id} hover className="overflow-hidden p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="neutral" size="sm">{dest.badge}</Badge>
                  <span className="text-xs font-semibold text-teal font-mono">{dest.cost}</span>
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-1">{dest.name}</h3>
                <p className="text-xs text-primary font-medium mb-3">{dest.state}</p>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">{dest.tagline}</p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to={`/plan?dest=${dest.id}`}
                  className="text-xs font-bold text-primary hover:text-primary-600 flex items-center gap-1"
                >
                  Plan This Trip <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-gray-400">Verified Guide</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-navy-900 text-white space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-navy-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-800 text-[11px] font-mono text-teal mb-2">
                Traveler Stories
              </div>
              <h2 className="text-2xl font-bold font-display text-white">
                Loved by Travelers Across India
              </h2>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-navy-800/60 border border-navy-700/60 space-y-3">
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "It planned Jaipur's Amber Fort, Hawa Mahal, and City Palace in the most logical order, saving us hours of running back and forth across town."
              </p>
              <div className="text-xs font-bold text-white">Rahul Verma</div>
              <div className="text-[11px] text-teal">Solo Backpacker • Jaipur 3-Day Trip</div>
            </div>

            <div className="p-5 rounded-2xl bg-navy-800/60 border border-navy-700/60 space-y-3">
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "We had three people on our Goa trip with different budgets and dietary preferences. The group planner made everyone happy with zero arguing."
              </p>
              <div className="text-xs font-bold text-white">Pooja Nair</div>
              <div className="text-[11px] text-teal">Group Coordinator • Goa 4-Day Trip</div>
            </div>

            <div className="p-5 rounded-2xl bg-navy-800/60 border border-navy-700/60 space-y-3">
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "When unexpected rain hit Delhi, we were able to swap outdoor gardens for the National Crafts Museum instantly with one tap."
              </p>
              <div className="text-xs font-bold text-white">Aditya Sengupta</div>
              <div className="text-[11px] text-teal">Family Traveler • Delhi 2-Day Trip</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-primary to-primary-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-3xl font-black font-display text-white tracking-tight">
              Ready to Plan Your Next Journey?
            </h2>
            <p className="text-sm text-primary-100 max-w-xl">
              Experience effortless, constraint-aware travel planning in seconds.
            </p>
          </div>
          <Link
            to="/plan"
            className="px-8 py-4 rounded-xl bg-white text-navy-900 font-bold text-sm hover:bg-gray-100 transition-all shadow-md shrink-0"
          >
            Launch Trip Wizard
          </Link>
        </div>
      </section>
    </div>
  );
};
