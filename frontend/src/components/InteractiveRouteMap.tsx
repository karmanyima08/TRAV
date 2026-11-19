import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  ExternalLink,
  Map as MapIcon,
  Route as RouteIcon,
  Info,
  Clock,
  DollarSign
} from 'lucide-react';
import { Activity } from '../services/types';

interface InteractiveRouteMapProps {
  activities: Activity[];
  destinationName: string;
  dayNumber: number;
}

const DEST_CENTERS: Record<string, { lat: number; lng: number }> = {
  jaipur: { lat: 26.9124, lng: 75.7873 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  goa: { lat: 15.2993, lng: 74.1240 },
  agra: { lat: 27.1767, lng: 78.0081 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  mumbai: { lat: 18.9220, lng: 72.8347 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
};

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  activities = [],
  destinationName,
  dayNumber,
}) => {
  const [selectedPin, setSelectedPin] = useState<Activity | null>(activities[0] || null);
  const [viewMode, setViewMode] = useState<'street' | 'waypoints'>('street');

  // Filter valid geographic coordinates
  const validActivities = activities.filter(
    (a) => typeof a.lat === 'number' && typeof a.lng === 'number' && !isNaN(a.lat) && !isNaN(a.lng)
  );

  const destKey = destinationName.toLowerCase().trim();
  const fallbackCenter =
    DEST_CENTERS[destKey] ||
    (validActivities[0]
      ? { lat: validActivities[0].lat!, lng: validActivities[0].lng! }
      : { lat: 26.9124, lng: 75.7873 });

  const lats = validActivities.length > 0 ? validActivities.map((a) => a.lat!) : [fallbackCenter.lat];
  const lngs = validActivities.length > 0 ? validActivities.map((a) => a.lng!) : [fallbackCenter.lng];

  const rawMinLat = Math.min(...lats);
  const rawMaxLat = Math.max(...lats);
  const rawMinLng = Math.min(...lngs);
  const rawMaxLng = Math.max(...lngs);

  // Margin padding: ensure minimum bounding span of 0.05 degrees (~5.5 km)
  const latSpan = Math.max(0.05, (rawMaxLat - rawMinLat) * 1.4);
  const lngSpan = Math.max(0.05, (rawMaxLng - rawMinLng) * 1.4);

  const centerLat = (rawMinLat + rawMaxLat) / 2;
  const centerLng = (rawMinLng + rawMaxLng) / 2;

  const minLat = centerLat - latSpan / 2;
  const maxLat = centerLat + latSpan / 2;
  const minLng = centerLng - lngSpan / 2;
  const maxLng = centerLng + lngSpan / 2;

  // Map coordinates to SVG viewbox (width: 520, height: 320)
  const getCoordinates = (lat?: number, lng?: number) => {
    const aLat = lat ?? centerLat;
    const aLng = lng ?? centerLng;
    const x = 50 + ((aLng - minLng) / lngSpan) * 420;
    const y = 280 - ((aLat - minLat) / latSpan) * 230;
    return {
      x: Math.max(30, Math.min(490, x)),
      y: Math.max(30, Math.min(290, y)),
    };
  };

  const points = validActivities.map((a) => getCoordinates(a.lat, a.lng));

  const targetLat = selectedPin?.lat || centerLat;
  const targetLng = selectedPin?.lng || centerLng;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${targetLat}%2C${targetLng}`;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-5 sm:p-6 space-y-4">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            Interactive Route Map (Day {dayNumber})
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {destinationName} • {validActivities.length} waypoints scheduled
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-gray-200 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('street')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'street'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-navy-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Street Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode('waypoints')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'waypoints'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-navy-900'
            }`}
          >
            <RouteIcon className="w-3.5 h-3.5" />
            Route Diagram
          </button>
        </div>
      </div>

      {/* Map Display Container */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-slate-900">
        {viewMode === 'street' ? (
          /* Live OpenStreetMap Interactive Tile View */
          <div className="w-full h-full relative">
            <iframe
              title="OpenStreetMap View"
              src={osmEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
            />
            {/* Quick overlay badge */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-gray-200/80 text-[11px] font-semibold text-navy-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span>OpenStreetMap Live Tiles</span>
            </div>
          </div>
        ) : (
          /* SVG Route Flow Diagram */
          <div className="w-full h-full relative bg-slate-950 flex items-center justify-center">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

            <svg className="w-full h-full" viewBox="0 0 520 320">
              {/* Connecting dashed transit route lines */}
              {points.length > 1 && (
                <polyline
                  points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#3563E9"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
              )}

              {/* Transit line glow underlay */}
              {points.length > 1 && (
                <polyline
                  points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#20BFA9"
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                />
              )}

              {/* Attraction Waypoint Markers */}
              {validActivities.map((act, idx) => {
                const { x, y } = getCoordinates(act.lat, act.lng);
                const isSelected = selectedPin?.attraction_id === act.attraction_id;

                return (
                  <g
                    key={act.attraction_id || idx}
                    className="cursor-pointer transition-transform"
                    onClick={() => setSelectedPin(act)}
                  >
                    {/* Pulsing ring for selected pin */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="20"
                        fill="#3563E9"
                        fillOpacity="0.3"
                        className="animate-ping"
                      />
                    )}
                    {/* Outer ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 14 : 11}
                      fill={isSelected ? '#3563E9' : '#0F172A'}
                      stroke={isSelected ? '#20BFA9' : '#64748B'}
                      strokeWidth="2.5"
                    />
                    {/* Number label */}
                    <text
                      x={x}
                      y={y + 4}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#FFFFFF"
                      textAnchor="middle"
                    >
                      {idx + 1}
                    </text>
                    {/* Name pill label */}
                    <text
                      x={x}
                      y={y - 16}
                      fontSize="9"
                      fontWeight="600"
                      fill="#E2E8F0"
                      textAnchor="middle"
                      className="select-none pointer-events-none drop-shadow"
                    >
                      {act.name?.length > 18 ? `${act.name.slice(0, 16)}...` : act.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Quick legend */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-[11px] text-gray-300 font-mono flex items-center gap-4 border border-white/10">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Waypoint Pin
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-teal" /> Transit Path
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Marker Detail Card */}
      {selectedPin ? (
        <div className="p-4 rounded-2xl bg-surface border border-gray-200 text-xs space-y-2 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                {activities.findIndex((a) => a.attraction_id === selectedPin.attraction_id) + 1 || 1}
              </span>
              <span className="font-bold text-navy-900 text-sm">{selectedPin.name}</span>
            </div>
            <span className="text-[11px] font-mono text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full">
              {selectedPin.time_window}
            </span>
          </div>

          <p className="text-[11px] text-text-secondary line-clamp-2">{selectedPin.description}</p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/80 text-[11px] text-gray-600">
            <div className="flex items-center gap-3">
              <span>
                Entry:{' '}
                <strong className="text-navy-900">
                  {selectedPin.entry_fee === 0 ? 'Free' : `₹${selectedPin.entry_fee}`}
                </strong>
              </span>
              <span>
                Duration: <strong className="text-navy-900">{selectedPin.duration_hours}h</strong>
              </span>
              <span className="text-teal font-medium capitalize">{selectedPin.category}</span>
            </div>

            {selectedPin.lat && selectedPin.lng && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedPin.lat},${selectedPin.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:text-primary-600 font-semibold text-[11px]"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-gray-400 text-center py-2">
          Click on any waypoint marker to preview its timing, location, and directions.
        </div>
      )}
    </div>
  );
};
