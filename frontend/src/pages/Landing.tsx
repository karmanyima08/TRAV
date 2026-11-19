import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  Cpu,
  MapPin,
  Clock,
  ArrowRight,
  Sliders,
  Users,
  Search,
  CheckCircle,
  Star,
  Layers,
  Activity
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
              <span>University AI Research Project — CSE3705 Implementation</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
              Intelligent, Constraint-Based <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal via-primary-200 to-primary">
                Travel Planning
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed max-w-2xl mx-auto">
              Replace dozens of scattered browser tabs with deterministic Artificial Intelligence.
              Powered by real <strong>A* Search</strong>, <strong>CSP Backtracking with MRV/LCV</strong>,
              and a cooperative <strong>Multi-Agent Expert System</strong>.
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
              <Link
                to="/ai-explorer"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-navy-800 text-gray-200 border border-navy-700 font-semibold text-sm hover:bg-navy-700 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4 text-teal" />
                Launch AI Visualizer
              </Link>
            </div>

            {/* Quick floating specs */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto border-t border-navy-800/80">
              <div className="text-center">
                <div className="text-xl font-extrabold text-white">5 Algorithms</div>
                <div className="text-xs text-gray-400">BFS, DFS, UCS, Greedy, A*</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-extrabold text-teal">12 Constraints</div>
                <div className="text-xs text-gray-400">CSP Backtracking & MRV</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-extrabold text-white">28 Rules</div>
                <div className="text-xs text-gray-400">Forward Chaining KB</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-extrabold text-blue-400">5 Agents</div>
                <div className="text-xs text-gray-400">PEAS Architecture</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <Badge variant="primary" size="md">Workflow Architecture</Badge>
          <h2 className="text-3xl font-bold font-display text-navy-900">
            How TRAVORA Generates Feasible Trips
          </h2>
          <p className="text-sm text-text-secondary">
            Unlike static prompts or generic LLM hallucinations, our deterministic AI pipeline proves feasibility at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {[
            {
              step: '01',
              title: 'Specify Constraints',
              desc: 'Enter destination, travel days, total budget, walking stamina, dietary restrictions, and interest profile.',
              icon: Sliders
            },
            {
              step: '02',
              title: 'A* State Space Search',
              desc: 'Explores states to find the optimal sequence of attractions maximizing preference scores while bounding path cost.',
              icon: Cpu
            },
            {
              step: '03',
              title: 'CSP Constraint Solving',
              desc: 'Backtracking with MRV and Forward Checking verifies operating hours, transit time, and no schedule overlap.',
              icon: Layers
            },
            {
              step: '04',
              title: 'Adaptive Execution',
              desc: 'View rich day-wise schedules with XAI explanations, simulate budget what-ifs, and dynamically recover closed venues.',
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

      {/* Course AI Topics Grid (Mandatory Course Concept Showcase) */}
      <section className="bg-surface py-16 border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <Badge variant="teal" size="md">Academic Handout Implementation</Badge>
            <h2 className="text-3xl font-bold font-display text-navy-900">
              Integrated AI Course Topics (CSE3705)
            </h2>
            <p className="text-sm text-text-secondary">
              Actual running algorithms executing on backend Python modules, directly influencing itinerary generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hover className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary">TOPIC 2</span>
                <Badge variant="primary" size="sm">A* Search</Badge>
              </div>
              <h3 className="font-bold text-base text-navy-900">State Space Search Engine</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Represents itinerary creation as state transitions. Uses evaluation function <code>f(n) = g(n) + h(n)</code> with an admissible heuristic based on minimum entry fees and spatial distance.
              </p>
              <div className="pt-2 text-[11px] font-mono text-navy-700 bg-gray-50 p-2 rounded-lg">
                Algorithms: BFS, DFS, UCS, Greedy, A*
              </div>
            </Card>

            <Card hover className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-teal">TOPIC 3</span>
                <Badge variant="teal" size="sm">CSP Solver</Badge>
              </div>
              <h3 className="font-bold text-base text-navy-900">Constraint Satisfaction (CSP)</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Schedules morning, afternoon, and evening slots. Employs Backtracking Search with MRV (Minimum Remaining Values), Degree heuristic, LCV, and Forward Checking.
              </p>
              <div className="pt-2 text-[11px] font-mono text-navy-700 bg-gray-50 p-2 rounded-lg">
                12 Hard & Soft Real-world Constraints
              </div>
            </Card>

            <Card hover className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-500">TOPIC 4</span>
                <Badge variant="primary" size="sm">Rule-Based</Badge>
              </div>
              <h3 className="font-bold text-base text-navy-900">Knowledge Base & Reasoning</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Production rule-base with 28 IF-THEN rules executing Forward Chaining inference. Transparently justifies attraction recommendations and dietary compliance.
              </p>
              <div className="pt-2 text-[11px] font-mono text-navy-700 bg-gray-50 p-2 rounded-lg">
                Explainable AI (XAI) Recommendation Justifications
              </div>
            </Card>

            <Card hover className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-600">TOPIC 5</span>
                <Badge variant="purple" size="sm">Multi-Agent</Badge>
              </div>
              <h3 className="font-bold text-base text-navy-900">Intelligent Multi-Agent System</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Modular architecture with 5 cooperating autonomous agents (Destination, Preference, Planning, Validation, Optimization) coordinated with PEAS formalization.
              </p>
              <div className="pt-2 text-[11px] font-mono text-navy-700 bg-gray-50 p-2 rounded-lg">
                Documented PEAS Framework & Real-time Audit
              </div>
            </Card>

            <Card hover className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-600">ADAPTIVE</span>
                <Badge variant="warning" size="sm">Dynamic Recovery</Badge>
              </div>
              <h3 className="font-bold text-base text-navy-900">Dynamic Itinerary Recovery</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                When a monument is reported closed, renovated, or rained out, the system isolates and repairs the affected slot without disrupting the remainder of the trip.
              </p>
              <div className="pt-2 text-[11px] font-mono text-navy-700 bg-gray-50 p-2 rounded-lg">
                Local CSP Rescheduling & Cost/Time Differentials
              </div>
            </Card>

            <Card hover className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-600">OPTIMIZATION</span>
                <Badge variant="teal" size="sm">Group Optimizer</Badge>
              </div>
              <h3 className="font-bold text-base text-navy-900">Group Travel & Budget Simulator</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Balances conflicting group member interests through weighted preference aggregation. Includes a what-if budget slider recalculating accommodation & food tiers.
              </p>
              <div className="pt-2 text-[11px] font-mono text-navy-700 bg-gray-50 p-2 rounded-lg">
                Satisfaction Harmony Index & Expenditure Diff
              </div>
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
              Explore Seeded Indian Cities
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Complete Knowledge Base facts seeded with real operating hours, ticket fees, and geographic coordinates.
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
                  Generate AI Plan <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-gray-400">Knowledge Base Verified</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials (Sample / Demo Content as required) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-navy-900 text-white space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-navy-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-800 text-[11px] font-mono text-teal mb-2">
                Sample Testimonials / Academic Evaluation Data
              </div>
              <h2 className="text-2xl font-bold font-display text-white">
                Validated by Student Travelers & AI Evaluators
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
                "The A* search combined with CSP Forward Checking scheduled Jaipur's Amber Fort, Hawa Mahal, and City Palace in optimal geographic order without time conflicts."
              </p>
              <div className="text-xs font-bold text-white">Rahul Verma</div>
              <div className="text-[11px] text-teal">Solo Backpacker • Jaipur 3-Day Trip</div>
            </div>

            <div className="p-5 rounded-2xl bg-navy-800/60 border border-navy-700/60 space-y-3">
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "We had three people in our Goa trip with conflicting budgets and diets. The Group Optimizer balanced vegetarian dining and beach watersports seamlessly."
              </p>
              <div className="text-xs font-bold text-white">Pooja Nair</div>
              <div className="text-[11px] text-teal">Group Coordinator • Goa 4-Day Trip</div>
            </div>

            <div className="p-5 rounded-2xl bg-navy-800/60 border border-navy-700/60 space-y-3">
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "When a sudden rain shower occurred in Delhi, the Dynamic Recovery Agent substituted open lawns with the indoor National Crafts Museum while keeping our dinner intact."
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
              Experience algorithmic constraint-satisfaction travel generation in seconds. Zero generic hallucinations.
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

