import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  light?: boolean;
  className?: string;
  asLink?: boolean;
}

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 38,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform hover:scale-105 ${className}`}
    >
      <defs>
        {/* Primary Jewel Gradient */}
        <linearGradient id="travoraPrimaryGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>

        {/* Shimmer Accent Gradient */}
        <linearGradient id="travoraAccentGrad" x1="12" y1="8" x2="38" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>

        {/* Ambient Drop Shadow */}
        <filter id="travoraGlow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2563EB" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Rounded squircle emblem container */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="13"
        fill="url(#travoraPrimaryGrad)"
        filter="url(#travoraGlow)"
      />

      {/* Subtle glass reflection highlight */}
      <path
        d="M2 15C2 7.8203 7.8203 2 15 2H33C40.1797 2 46 7.8203 46 15V18C33 19 15 24 2 30V15Z"
        fill="white"
        fillOpacity="0.12"
      />

      {/* Dynamic Geometric Delta Flight Wing / Compass Icon */}
      <g transform="translate(6, 6)">
        {/* Orbital Journey Path Loop */}
        <path
          d="M 6,24 C 6,10 18,6 28,12 C 34,16 32,26 23,26 C 14,26 12,18 20,13"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="1.5 3.5"
          strokeOpacity="0.55"
        />

        {/* Ascending Delta Wing / Traveler Jet */}
        <path
          d="M18 4L28 27L18 21.5L8 27L18 4Z"
          fill="white"
          className="drop-shadow-sm"
        />

        {/* Facet Shader for 3D Wing Depth */}
        <path
          d="M18 4L28 27L18 21.5Z"
          fill="#E0F2FE"
          fillOpacity="0.82"
        />

        {/* Central North Star Waypoint Diamond */}
        <circle cx="18" cy="14" r="2.2" fill="#0D9488" />
        <circle cx="18" cy="14" r="1.1" fill="white" />
      </g>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  light = false,
  className = '',
  asLink = true,
}) => {
  const iconSizes = { sm: 30, md: 38, lg: 48 };
  const textSizes = {
    sm: 'text-lg tracking-tight',
    md: 'text-xl tracking-tight',
    lg: 'text-2xl tracking-tight',
  };
  const tagSizes = {
    sm: 'text-[9px] -mt-0.5',
    md: 'text-[10px] -mt-1',
    lg: 'text-[11px] -mt-1',
  };

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <LogoIcon size={iconSizes[size]} />
      <div className="flex flex-col">
        <span
          className={`font-display font-extrabold leading-none ${textSizes[size]} ${
            light ? 'text-white' : 'text-navy-900 group-hover:text-primary'
          } transition-colors`}
        >
          TRAVORA
        </span>
        {showTagline && (
          <span
            className={`font-semibold uppercase tracking-wider ${tagSizes[size]} ${
              light ? 'text-teal-300' : 'text-teal'
            }`}
          >
            Smart Travel Planner
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};
