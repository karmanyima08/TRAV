import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('demo@travora.ai');
  const [password, setPassword] = useState('Travora2026!');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left branding banner */}
        <div className="p-8 sm:p-12 bg-navy-900 text-white flex flex-col justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-teal flex items-center justify-center text-white">
                <Compass className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="font-display font-extrabold text-2xl text-white">TRAVORA</span>
            </Link>
            <h2 className="text-2xl font-bold font-display leading-tight mb-3">
              Intelligent Itinerary Generator
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sign in to manage your saved travel itineraries, plan group trips, and simulate budget scenarios.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-800/80 border border-navy-700/80 text-xs text-gray-300 space-y-1.5 mt-8">
            <div className="text-teal font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Demo Credentials Preloaded
            </div>
            <div>Email: <code className="text-white">demo@travora.ai</code></div>
            <div>Password: <code className="text-white">Travora2026!</code></div>
          </div>
        </div>

        {/* Right Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold font-display text-navy-900">Sign In</h3>
            <p className="text-xs text-text-secondary mt-1">
              Enter your email and password to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign In to Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

