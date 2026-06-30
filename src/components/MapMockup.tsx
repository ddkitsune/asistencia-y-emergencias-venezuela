import React, { useState } from 'react';
import { Emergency, Volunteer, Incident, SocialPost } from '../types';
import { MapPin, Info, AlertTriangle, Users, Flame, Heart, Handshake, ShieldAlert } from 'lucide-react';

interface MapMockupProps {
  emergencies: Emergency[];
  volunteers: Volunteer[];
  incidents: Incident[];
  posts?: SocialPost[];
  onSelectLocation?: (lat: number, lng: number, city: string, state: string) => void;
  selectedCity?: string | null;
  onCityClick?: (city: string | null) => void;
}

interface VenezuelaCity {
  name: string;
  state: string;
  x: number; // percentage width on SVG
  y: number; // percentage height on SVG
  lat: number;
  lng: number;
}

// Key Venezuela cities mapped to SVG positions
const VENEZUELA_CITIES: VenezuelaCity[] = [
  { name: "Caracas", state: "Distrito Capital", x: 62, y: 15, lat: 10.4806, lng: -66.9036 },
  { name: "Maracaibo", state: "Zulia", x: 15, y: 18, lat: 10.6689, lng: -71.6441 },
  { name: "Maracay", state: "Aragua", x: 55, y: 17, lat: 10.2442, lng: -67.5973 },
  { name: "Valencia", state: "Carabobo", x: 51, y: 18, lat: 10.1691, lng: -67.9542 },
  { name: "Barquisimeto", state: "Lara", x: 40, y: 22, lat: 10.0678, lng: -69.3472 },
  { name: "San Cristóbal", state: "Táchira", x: 12, y: 45, lat: 7.7667, lng: -72.2250 },
  { name: "Barcelona", state: "Anzoátegui", x: 74, y: 18, lat: 10.1333, lng: -64.6833 },
  { name: "Ciudad Guayana", state: "Bolívar", x: 84, y: 38, lat: 8.3513, lng: -62.6410 },
  { name: "San Fernando", state: "Apure", x: 48, y: 42, lat: 7.8939, lng: -67.4724 },
  { name: "Mérida", state: "Mérida", x: 22, y: 36, lat: 8.5833, lng: -71.1333 },
];

export default function MapMockup({
  emergencies,
  volunteers,
  incidents,
  posts = [],
  onSelectLocation,
  selectedCity,
  onCityClick
}: MapMockupProps) {
  const [hoveredCity, setHoveredCity] = useState<VenezuelaCity | null>(null);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number; x: number; y: number } | null>(null);

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    // Approximate mapping for Venezuelan latitudes and longitudes
    // Venezuela limits: Longitude ~ -73 to -60 W, Latitude ~ 1 to 12 N
    const lng = -73 + (xPercent / 100) * 13;
    const lat = 12 - (yPercent / 100) * 11;

    // Find nearest preset city
    let nearestCity = VENEZUELA_CITIES[0];
    let minDist = Infinity;
    VENEZUELA_CITIES.forEach(c => {
      const dist = Math.sqrt(Math.pow(c.x - xPercent, 2) + Math.pow(c.y - yPercent, 2));
      if (dist < minDist) {
        minDist = dist;
        nearestCity = c;
      }
    });

    // If click is within 15% distance, snap to that city, else use precise computed coordinate
    const targetCity = minDist < 15 ? nearestCity : null;
    const cityName = targetCity ? targetCity.name : "Coordenada Manual";
    const stateName = targetCity ? targetCity.state : "Estado Detectado";

    setClickedCoords({ lat, lng, x: xPercent, y: yPercent });

    if (onSelectLocation) {
      onSelectLocation(
        parseFloat(lat.toFixed(4)),
        parseFloat(lng.toFixed(4)),
        cityName,
        stateName
      );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden" id="interactive-map-card">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <MapPin className="text-blue-600 animate-pulse" size={20} />
            Mapa Solidario de Ayuda Mutua
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Ubicación de ofrecimientos, necesidades comunitarias y alertas. Haz clic en el mapa para marcar coordenadas.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button 
            onClick={() => onCityClick && onCityClick(null)}
            className={`px-3 py-1.5 rounded-lg border transition duration-150 font-semibold cursor-pointer ${
              !selectedCity 
                ? 'bg-blue-600 border-blue-600 text-white shadow' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Todos
          </button>
          {VENEZUELA_CITIES.slice(0, 6).map(c => (
            <button
              key={c.name}
              onClick={() => onCityClick && onCityClick(c.name)}
              className={`px-3 py-1.5 rounded-lg border transition duration-150 font-semibold cursor-pointer ${
                selectedCity === c.name
                  ? 'bg-blue-600 border-blue-600 text-white shadow'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Frame */}
      <div className="relative aspect-[16/10] w-full bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center select-none overflow-hidden group shadow-inner">
        
        {/* Styled Grid Lines for cyber/control room look */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4%_6.6%] opacity-60 pointer-events-none"></div>
 
        {/* Venezuela Outline Visual Placeholder as SVG */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full text-slate-300 cursor-crosshair relative z-10"
          onClick={handleMapClick}
        >
          {/* Main Venezuela Map Contour Simplified for visual representation */}
          <path 
            d="M 10 18 Q 15 15 25 14 T 35 15 T 45 16 T 55 12 T 65 14 T 75 12 T 88 15 Q 92 20 89 28 T 85 40 T 80 50 T 84 62 T 76 68 T 68 62 T 58 55 T 48 58 T 42 50 T 30 46 T 15 44 T 10 32 Z" 
            fill="#f8fafc" 
            stroke="#cbd5e1" 
            strokeWidth="1.2"
            className="transition-all duration-300 hover:fill-slate-100/85"
          />

          {/* Lake Maracaibo */}
          <ellipse cx="16" cy="22" rx="3.5" ry="5" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />

          {/* Orinoco River representation */}
          <path d="M 45 42 Q 60 40 70 38 T 85 41" fill="none" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="2 2" />

          {/* Preset Cities Points */}
          {VENEZUELA_CITIES.map((city) => {
            const cityPosts = posts.filter(p => p.city.toLowerCase() === city.name.toLowerCase());
            
            // Check if there are social posts of different types
            const hasSolicitud = cityPosts.some(p => p.type === 'Solicitud');
            const hasAlerta = cityPosts.some(p => p.type === 'Alerta');
            const hasOfrecimiento = cityPosts.some(p => p.type === 'Ofrecimiento');

            // Fallback to legacy arrays if posts empty
            const hasLegacyEmergency = emergencies.some(e => e.city.toLowerCase() === city.name.toLowerCase() && e.status !== 'Resuelto');
            const hasLegacyIncident = incidents.some(i => i.city.toLowerCase() === city.name.toLowerCase());
            const hasLegacyVolunteer = volunteers.some(v => v.city.toLowerCase() === city.name.toLowerCase() && v.status === 'Disponible');

            const isRed = hasSolicitud || hasLegacyEmergency;
            const isAmber = hasAlerta || hasLegacyIncident;
            const isGreen = hasOfrecimiento || hasLegacyVolunteer;

            let nodeColor = "#64748b"; // slate grey default
            if (isRed) nodeColor = "#dc2626"; // Red (Solicitud)
            else if (isAmber) nodeColor = "#d97706"; // Amber (Alerta)
            else if (isGreen) nodeColor = "#10b981"; // Emerald Green (Ofrecimiento)

            return (
              <g 
                key={city.name}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredCity(city)}
                onMouseLeave={() => setHoveredCity(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onCityClick && onCityClick(city.name);
                  if (onSelectLocation) onSelectLocation(city.lat, city.lng, city.name, city.state);
                }}
              >
                {/* Glowing alert rings */}
                {(isRed || isAmber) && (
                  <circle 
                    cx={city.x} 
                    cy={city.y} 
                    r="4.5" 
                    fill="none" 
                    stroke={isRed ? "#dc2626" : "#d97706"} 
                    strokeWidth="1.2" 
                    className="animate-ping origin-center"
                    style={{ transformOrigin: `${city.x}% ${city.y}%` }}
                  />
                )}

                {/* Main city node */}
                <circle 
                  cx={city.x} 
                  cy={city.y} 
                  r="2.8" 
                  fill={nodeColor} 
                  className="transition-all hover:scale-150 duration-200"
                />

                {/* City name text for primary nodes */}
                {(city.name === "Caracas" || city.name === "Maracaibo" || city.name === "Barquisimeto" || city.name === "Maracay" || city.name === "Ciudad Guayana") && (
                  <text 
                    x={city.x} 
                    y={city.y - 4} 
                    textAnchor="middle" 
                    className="text-[2.2px] fill-slate-500 font-bold tracking-wider uppercase pointer-events-none"
                  >
                    {city.name}
                  </text>
                )}
              </g>
            );
          })}

          {/* Clicked location marker pin */}
          {clickedCoords && (
            <g className="animate-bounce">
              <path 
                d={`M ${clickedCoords.x} ${clickedCoords.y - 3.5} Q ${clickedCoords.x - 1} ${clickedCoords.y - 7} ${clickedCoords.x} ${clickedCoords.y - 7} T ${clickedCoords.x + 1} ${clickedCoords.y - 7} Z`} 
                fill="#2563eb" 
              />
              <circle cx={clickedCoords.x} cy={clickedCoords.y - 7} r="1" fill="#fff" />
              <circle cx={clickedCoords.x} cy={clickedCoords.y} r="1.5" fill="#2563eb" fillOpacity="0.5" />
            </g>
          )}
        </svg>

        {/* Floating tooltip */}
        {hoveredCity && (
          <div 
            className="absolute z-20 bg-white border border-slate-200 text-slate-800 p-3.5 rounded-xl shadow-xl text-xs pointer-events-none w-56 flex flex-col gap-1.5 transition-all"
            style={{ 
              left: `${Math.min(hoveredCity.x + 2, 60)}%`, 
              top: `${Math.min(hoveredCity.y + 2, 70)}%` 
            }}
          >
            <div className="font-bold text-slate-800 flex justify-between">
              <span>{hoveredCity.name}</span>
              <span className="text-[10px] text-slate-400 font-semibold">{hoveredCity.state}</span>
            </div>
            <div className="h-[1px] bg-slate-100 my-0.5"></div>
            
            <div className="flex flex-col gap-1 text-[11px]">
              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1">
                  <Handshake size={12} className="text-emerald-500" />
                  Ofrecimientos:
                </span>
                <span className="font-bold text-emerald-600">
                  {posts.filter(p => p.city === hoveredCity.name && p.type === 'Ofrecimiento').length}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1">
                  <Heart size={12} className="text-red-500" />
                  Necesidades / Lugares:
                </span>
                <span className="font-bold text-red-600">
                  {posts.filter(p => p.city === hoveredCity.name && p.type === 'Solicitud').length}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1">
                  <ShieldAlert size={12} className="text-amber-500" />
                  Alertas Comunitarias:
                </span>
                <span className="font-bold text-amber-600">
                  {posts.filter(p => p.city === hoveredCity.name && p.type === 'Alerta').length}
                </span>
              </div>
            </div>
            
            <div className="text-[9px] text-slate-400 font-mono mt-1 text-center font-semibold">
              Lat: {hoveredCity.lat}° | Lon: {hoveredCity.lng}°
            </div>
          </div>
        )}

        {/* Legend / Info panel on Map */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5 text-[10px] text-slate-600 shadow-md">
          <div className="font-bold text-slate-800 mb-0.5 text-[11px] uppercase tracking-wider">Mapeo Comunitario</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
            <span className="font-semibold text-slate-700">Tienen para Ayudar / Ofrecimiento ({posts.filter(p => p.type === 'Ofrecimiento').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 block animate-pulse"></span>
            <span className="font-semibold text-slate-700">Necesitan Ayuda / Lugares ({posts.filter(p => p.type === 'Solicitud').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block animate-pulse"></span>
            <span className="font-semibold text-slate-700">Alertas de Seguridad ({posts.filter(p => p.type === 'Alerta').length})</span>
          </div>
        </div>

        {/* Precise Coords overlay */}
        {clickedCoords && (
          <div className="absolute bottom-3 right-3 z-10 bg-white/95 border border-blue-200 rounded-xl p-2.5 text-[10px] text-slate-600 shadow-md font-mono flex flex-col gap-0.5">
            <div className="font-bold text-blue-600">PUNTO CAPTURADO</div>
            <div>Latitud: {clickedCoords.lat.toFixed(4)}° N</div>
            <div>Longitud: {clickedCoords.lng.toFixed(4)}° W</div>
            <div className="text-[8px] text-slate-400">Coordenadas listas para publicación</div>
          </div>
        )}
      </div>
    </div>
  );
}
