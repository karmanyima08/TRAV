import React from 'react';
import { Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-900 text-gray-300 py-10 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-navy-800/80">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-teal flex items-center justify-center text-white">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                TRAVORA
              </span>
              <p className="text-xs text-gray-400">
                Personalized, constraint-aware travel planning for unforgettable journeys.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span className="hover:text-white cursor-pointer transition-colors">About</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 text-center md:text-left text-xs text-gray-500">
          <p>© {new Date().getFullYear()} TRAVORA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
