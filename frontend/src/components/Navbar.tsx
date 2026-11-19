import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, Sliders, Users, MapPin, LayoutDashboard, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentTrip } = useTrip();
  const location = useLocation();

  const navLinks = [
    { label: 'Plan Trip', path: '/plan', icon: Compass },
    ...(currentTrip?.id
      ? [{ label: 'My Itinerary', path: `/itinerary/${currentTrip.id}`, icon: Calendar }]
      : []),
    {
      label: 'Budget Simulator',
      path: currentTrip?.id ? `/budget-simulator?tripId=${currentTrip.id}` : '/budget-simulator',
      icon: Sliders,
    },
    { label: 'Group Trip Planner', path: '/group-optimizer', icon: Users },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-teal flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-display font-extrabold text-xl tracking-tight text-navy-900 group-hover:text-primary transition-colors">
              TRAVORA
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-teal -mt-1">
              Smart Travel Planner
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-primary bg-primary/10 font-semibold'
                    : 'text-text-secondary hover:text-navy-900 hover:bg-gray-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Auth Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-gray-200/80 hover:border-primary/40 transition-all text-xs font-semibold text-navy-900"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-bold">
                  {user.name.charAt(0)}
                </div>
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-text-secondary hover:text-navy-900 px-3 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/plan"
                className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-primary-600 transition-all"
              >
                Plan My Trip
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

