import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  ExternalLink,
  Map as MapIcon,
  Route as RouteIcon,
  Clock,
  Car,
  ChevronRight,
  Info
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
  const [viewMode, setViewMode] = useState<'diagram' | 'street'>('diagram');
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);

  // Synchronize selected pin whenever dayNumber or activities change
  useEffect(() => {
    setSelectedPin(activities[0] || null);
    setIframeLoading(true);
  }, [dayNumber, activities]);

  // Filter valid activities with coordinates
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

  // Dynamic span with 35% margin padding
  const latSpan = Math.max(0.04, (rawMaxLat - rawMinLat) * 1.45);
  const lngSpan = Math.max(0.04, (rawMaxLng - rawMinLng) * 1.45);

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
    const y = 270 - ((aLat - minLat) / latSpan) * 220;
    return {
      x: Math.max(40, Math.min(480, x)),
      y: Math.max(40, Math.min(270, y)),
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
            Day {dayNumber} Route Map & Waypoints
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {destinationName} • {activities.length} Waypoints Scheduled
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-gray-200 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('diagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'diagram'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-navy-900'
            }`}
          >
            <RouteIcon className="w-3.5 h-3.5" />
            Route Diagram
          </button>
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
            Street View
          </button>
        </div>
      </div>

      {/* Map Graphic Canvas */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-slate-950">
        {viewMode === 'diagram' ? (
          /* Instant-Load High-Contrast Vector Route Diagram */
          <div className="w-full h-full relative flex items-center justify-center">
            {/* Background grid texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-45" />

            {/* Compass rose accent */}
            <div className="absolute top-3 right-3 text-slate-700 pointer-events-none select-none flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500">N</span>
              <div className="w-0.5 h-5 bg-gradient-to-b from-primary to-slate-700" />
            </div>

            <svg className="w-full h-full" viewBox="0 0 520 320">
              <defs>
                <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3563E9" />
                  <stop offset="100%" stopColor="#20BFA9" />
                </linearGradient>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Connecting Transit Route Segments */}
              {points.length > 1 && (
                <>
                  <polyline
                    points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#20BFA9"
                    strokeWidth="2"
                    strokeOpacity="0.4"
                  />
                  <polyline
                    points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="url(#routeGlow)"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                </>
              )}

              {/* Mid-point transit badges */}
              {points.map((p, idx) => {
                if (idx === points.length - 1) return null;
                const nextP = points[idx + 1];
                const midX = (p.x + nextP.x) / 2;
                const midY = (p.y + nextP.y) / 2;
                const nextAct = validActivities[idx + 1];

                return (
                  <g key={`transit-${idx}`} className="select-none pointer-events-none">
                    <rect
                      x={midX - 28}
                      y={midY - 9}
                      width="56"
                      height="18"
                      rx="9"
                      fill="#0F172A"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={midY + 3.5}
                      fontSize="9"
                      fill="#94A3B8"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {nextAct?.transit_from_previous_min || 15}m transit
                    </text>
                  </g>
                );
              })}

              {/* Waypoint Pins */}
              {validActivities.map((act, idx) => {
                const { x, y } = getCoordinates(act.lat, act.lng);
                const isSelected = selectedPin?.attraction_id === act.attraction_id;

                return (
                  <g
                    key={act.attraction_id || idx}
                    className="cursor-pointer transition-transform duration-150"
                    onClick={() => setSelectedPin(act)}
                  >
                    {/* Pulsing ring for selected pin */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="22"
                        fill="#3563E9"
                        fillOpacity="0.28"
                        className="animate-ping"
                      />
                    )}
                    {/* Outer marker pin */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 14 : 11}
                      fill={isSelected ? '#3563E9' : '#0F172A'}
                      stroke={isSelected ? '#20BFA9' : '#64748B'}
                      strokeWidth={isSelected ? 3 : 2}
                      filter="url(#shadow)"
                    />
                    {/* Number text */}
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

                    {/* Landmark Name Label */}
                    <g transform={`translate(${x}, ${y - 18})`}>
                      <rect
                        x={-Math.min(60, (act.name?.length || 10) * 3.5)}
                        y="-12"
                        width={Math.min(120, (act.name?.length || 10) * 7)}
                        height="16"
                        rx="8"
                        fill="#0F172A"
                        fillOpacity="0.88"
                        stroke={isSelected ? '#3563E9' : '#1E293B'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="0"
                        fontSize="9"
                        fontWeight="600"
                        fill={isSelected ? '#60A5FA' : '#E2E8F0'}
                        textAnchor="middle"
                        className="select-none pointer-events-none"
                      >
                        {act.name?.length > 18 ? `${act.name.slice(0, 16)}...` : act.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Quick Map Legend */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-[11px] text-gray-300 font-mono flex items-center gap-3 border border-white/10">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Stop
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-teal" /> Route Path
              </span>
            </div>
          </div>
        ) : (
          /* Live Street Map Iframe View */
          <div className="w-full h-full relative">
            {iframeLoading && (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-2 text-white z-10">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-300">Loading street map tiles...</span>
              </div>
            )}
            <iframe
              title="OpenStreetMap View"
              src={osmEmbedUrl}
              className="w-full h-full border-0"
              onLoad={() => setIframeLoading(false)}
            />
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-gray-200 text-[11px] font-semibold text-navy-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span>OpenStreetMap Live</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Waypoint Detail Card */}
      {selectedPin ? (
        <div className="p-4 rounded-2xl bg-surface border border-gray-200 text-xs space-y-2.5 transition-all shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-primary text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {activities.findIndex((a) => a.attraction_id === selectedPin.attraction_id) + 1 || 1}
              </span>
              <div>
                <span className="font-bold text-navy-900 text-sm block">{selectedPin.name}</span>
                <span className="text-[11px] text-text-secondary capitalize">
                  {selectedPin.slot_label || 'Scheduled'} slot
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                {selectedPin.time_window}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-text-secondary leading-relaxed">{selectedPin.description}</p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-gray-200 text-[11px] text-gray-600">
            <div className="flex items-center gap-4">
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
                className="inline-flex items-center gap-1.5 text-primary hover:text-primary-700 font-bold text-[11px] bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-lg transition-colors"
              >
                <span>Open in Google Maps</span>
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

      {/* Instant Waypoint Sequence Strip */}
      {activities.length > 0 && (
        <div className="space-y-1.5 pt-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Daily Waypoint Sequence
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {activities.map((act, i) => {
              const isSelected = selectedPin?.attraction_id === act.attraction_id;
              return (
                <button
                  key={act.attraction_id || i}
                  type="button"
                  onClick={() => setSelectedPin(act)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                    <span className="font-semibold capitalize text-teal">{act.slot_label || `Stop ${i + 1}`}</span>
                    <span className="font-mono">{act.time_window}</span>
                  </div>
                  <div className="font-bold text-xs text-navy-900 line-clamp-1">{act.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
