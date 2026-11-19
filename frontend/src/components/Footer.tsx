import React from 'react';
import { Logo } from './ui/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-900 text-gray-300 py-10 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-navy-800/80">
          {/* Logo & Tagline */}
          <div className="space-y-1">
            <Logo light size="md" showTagline={false} />
            <p className="text-xs text-gray-400 pl-1">
              Personalized, constraint-aware travel planning for unforgettable journeys.
            </p>
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
