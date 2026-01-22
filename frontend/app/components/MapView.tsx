'use client';
import React, { useRef, useMemo } from 'react';
import Map, { 
  Marker, 
  NavigationControl, 
  FullscreenControl, 
  GeolocateControl, 
  Layer,
  Source
} from 'react-map-gl/maplibre'; 
import 'maplibre-gl/dist/maplibre-gl.css'; 
import { AlertTriangle, Crosshair } from 'lucide-react';

// 🔑 YOUR MAPTILER KEY
const API_KEY = '553TCsgFoj7gT9dixu0g'; 

interface Props {
  riskLevel?: string | null;
}

const MapView = ({ riskLevel }: Props) => {
  const mapRef = useRef<any>(null);

  // 1. STYLE: Basic Dark (Cleanest for 3D)
  const mapStyle = `https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${API_KEY}`;

  // 2. VIEW: Cinematic Start
  const initialView = {
    longitude: -74.006, 
    latitude: 40.7128,
    zoom: 15,     // Slightly zoomed out to show more context
    pitch: 60,    
    bearing: -20  
  };

  // 3. LAYER: 3D Buildings (Fixed Visibility)
  const buildingLayer: any = useMemo(() => ({
    id: '3d-buildings',
    source: 'maptiler_planet',
    'source-layer': 'building',
    type: 'fill-extrusion',
    minzoom: 13, // FIX: Buildings now visible even when zoomed out
    paint: {
      'fill-extrusion-color': '#2d3b4b', // Dark Steel Blue
      'fill-extrusion-height': [
        'interpolate', ['linear'], ['zoom'],
        13, 0,
        15.05, ['get', 'render_height']
      ],
      'fill-extrusion-base': [
        'interpolate', ['linear'], ['zoom'],
        13, 0,
        15.05, ['get', 'render_min_height']
      ],
      'fill-extrusion-opacity': 0.85,
      'fill-extrusion-vertical-gradient': true 
    }
  }), []);

  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-black overflow-hidden">
      
      {/* CSS: Hide Watermarks & Reposition Controls Manually */}
      <style>{`
        .maplibregl-ctrl-attrib, .maplibregl-ctrl-logo { display: none !important; }
        
        /* FIX: Move controls to Bottom-Center to avoid Sidebars */
        .maplibregl-ctrl-top-right {
           position: absolute;
           bottom: 30px;
           left: 50%;
           transform: translateX(-50%);
           top: auto !important;
           right: auto !important;
           display: flex;
           gap: 8px;
           background: transparent;
           box-shadow: none !important;
        }
        .maplibregl-ctrl-group {
           background: rgba(0, 0, 0, 0.8) !important;
           border: 1px solid rgba(255, 255, 255, 0.2);
           backdrop-filter: blur(4px);
        }
        .maplibregl-ctrl button {
           filter: invert(1); /* Make icons white */
        }
      `}</style>

      <Map
        ref={mapRef}
        initialViewState={initialView}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        attributionControl={false}
        terrain={{ source: 'maptiler_planet', exaggeration: 1.2 }} 
        maxPitch={85}
      >
        {/* --- CONTROLS: Floating Center Dock (Won't be hidden) --- */}
        <NavigationControl position="top-right" showCompass={true} showZoom={true} visualizePitch={true} />
        <FullscreenControl position="top-right" />
        <GeolocateControl position="top-right" />

        {/* --- 3D LAYER --- */}
        <Layer {...buildingLayer} />

        {/* --- MARKER --- */}
        {riskLevel && (
          <Marker longitude={-74.006} latitude={40.7128} anchor="bottom">
             <div className="relative flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform duration-300">
              <div className={`absolute w-16 h-16 rounded-full opacity-40 animate-[ping_2s_linear_infinite] ${
                riskLevel === 'CRITICAL' ? 'bg-neon-red' : 'bg-orange-500'
              }`}></div>
              <div className={`relative z-10 p-3 rounded-full border-2 backdrop-blur-md shadow-[0_0_30px_currentColor] ${
                 riskLevel === 'CRITICAL' ? 'bg-black/80 border-neon-red text-neon-red' : 'bg-black/80 border-orange-500 text-orange-500'
              }`}>
                <AlertTriangle size={28} strokeWidth={2.5} />
              </div>
              <div className="absolute -top-12 bg-black/90 text-white text-[10px] px-3 py-1.5 rounded border border-gray-700 font-mono tracking-[0.2em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all shadow-xl backdrop-blur-md">
                SECTOR 4: {riskLevel}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-700"></div>
              </div>
            </div>
          </Marker>
        )}
      </Map>
      
      {/* DECOR: Center Target Reticle (Fixed to Screen) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
         <Crosshair size={40} className="text-neon-blue" strokeWidth={1} />
      </div>

      {/* ATMOSPHERE: Horizon Glow */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black via-black/50 to-transparent pointer-events-none z-10"></div>
    </div>
  );
};

export default MapView;