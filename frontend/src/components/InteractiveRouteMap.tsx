import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Layers, Info } from 'lucide-react';
import { Activity } from '../services/types';

interface InteractiveRouteMapProps {
  activities: Activity[];
  destinationName: string;
  dayNumber: number;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  activities = [],
  destinationName,
  dayNumber,
}) => {
  const [selectedPin, setSelectedPin] = useState<Activity | null>(activities[0] || null);

  // Compute normalized relative coordinates for SVG plotting
  const lats = activities.map((a) => a.lat || 26.9).filter(Boolean);
  const lngs = activities.map((a) => a.lng || 75.8).filter(Boolean);

  const minLat = Math.min(...lats, 26.8);
  const maxLat = Math.max(...lats, 27.0);
  const minLng = Math.min(...lngs, 75.7);
  const maxLng = Math.max(...lngs, 75.9);

  const latSpan = Math.max(0.02, maxLat - minLat);
  const lngSpan = Math.max(0.02, maxLng - minLng);

  // Map coordinates to SVG viewbox (width: 500, height: 320)
  const getCoordinates = (lat?: number, lng?: number) => {
    const aLat = lat || (minLat + maxLat) / 2;
    const aLng = lng || (minLng + maxLng) / 2;
    const x = 50 + ((aLng - minLng) / lngSpan) * 400;
    const y = 280 - ((aLat - minLat) / latSpan) * 220; // Invert latitude for SVG
    return { x, y };
  };

  const points = activities.map((a) => getCoordinates(a.lat, a.lng));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-primary" />
            Interactive Route Map (Day {dayNumber})
          </h3>
          <p className="text-[11px] text-gray-500">
            {destinationName} • {activities.length} Waypoints Scheduled
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-teal bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
          <Navigation className="w-3 h-3" />
          <span>Active Route Path</span>
        </div>
      </div>

      {/* Map Graphic Canvas */}
      <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
        {/* Subtle Map Grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

        <svg className="w-full h-full" viewBox="0 0 500 320">
          {/* Route path line */}
          {points.length > 1 && (
            <polyline
              points={points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#3563E9"
              strokeWidth="3"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          )}

          {/* Solid underlay line */}
          {points.length > 1 && (
            <polyline
              points={points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#20BFA9"
              strokeWidth="1.5"
              strokeOpacity="0.7"
            />
          )}

          {/* Attraction Markers */}
          {activities.map((act, idx) => {
            const { x, y } = getCoordinates(act.lat, act.lng);
            const isSelected = selectedPin?.attraction_id === act.attraction_id;

            return (
              <g
                key={act.attraction_id}
                className="cursor-pointer transition-transform"
                onClick={() => setSelectedPin(act)}
              >
                {/* Glow ring for selected */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="18"
                    fill="#3563E9"
                    fillOpacity="0.25"
                    className="animate-ping"
                  />
                )}
                {/* Pin circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 13 : 10}
                  fill={isSelected ? '#3563E9' : '#101D35'}
                  stroke={isSelected ? '#20BFA9' : '#94A3B8'}
                  strokeWidth="2.5"
                />
                <text
                  x={x}
                  y={y + 3.5}
                  fontSize="9"
                  fontWeight="bold"
                  fill="#FFFFFF"
                  textAnchor="middle"
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Legend */}
        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur-sm text-[10px] text-gray-300 font-mono flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" /> Waypoint Pin
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-teal" /> Transit Path
          </span>
        </div>
      </div>

      {/* Selected Marker Detail Card */}
      {selectedPin ? (
        <div className="p-3.5 rounded-xl bg-surface border border-gray-200/80 text-xs space-y-1.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy-900 text-sm">{selectedPin.name}</span>
            <span className="text-[11px] font-mono text-primary font-bold">{selectedPin.time_window}</span>
          </div>
          <div className="text-[11px] text-gray-500 line-clamp-1">{selectedPin.description}</div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100 text-gray-600">
            <span>Entry: {selectedPin.entry_fee === 0 ? 'Free' : `₹${selectedPin.entry_fee}`}</span>
            <span>Est. Duration: {selectedPin.duration_hours}h</span>
            <span className="text-teal font-medium capitalize">{selectedPin.category}</span>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-gray-400 text-center py-2">
          Click on any map marker pin to preview location details.
        </div>
      )}
    </div>
  );
};

