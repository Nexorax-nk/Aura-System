import React from 'react';
import { Radar, AlertTriangle } from 'lucide-react';

interface Props {
  loading: boolean;
  riskLevel?: string | null;
}

const MapPlaceholder = ({ loading, riskLevel }: Props) => {
  // 1. Determine Base Color State
  const isCritical = riskLevel === 'CRITICAL';
  let textColor = "text-gray-600";
  let glowColor = "bg-blue-500/5";

  if (loading) {
    textColor = "text-neon-blue";
    glowColor = "bg-neon-blue/10";
  } else if (isCritical) {
    textColor = "text-neon-red";
    glowColor = "bg-neon-red/20";
  }

  return (
    <div className={`flex-1 relative flex items-center justify-center overflow-hidden border-x border-gray-800 transition-all duration-500 ${glowColor}`}>
       
       {/* Background Subtle Tech Grid */}
       <div className="absolute inset-0 opacity-20 pointer-events-none"
             style={{
                backgroundImage: `linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
             }}>
       </div>

       {/* Central Status Indicator */}
       <div className={`z-10 flex flex-col items-center gap-4 font-mono uppercase tracking-widest transition-all duration-300 ${textColor}`}>
          
          {loading ? (
              // LOADING STATE
              <>
                <Radar className="w-16 h-16 animate-[spin_3s_linear_infinite]" />
                <span className="text-xl animate-pulse">Analyzing Data Streams...</span>
              </>
          ) : isCritical ? (
              // CRITICAL STATE
              <>
                 <AlertTriangle className="w-20 h-20 animate-bounce" />
                 <span className="text-3xl font-black drop-shadow-[0_0_10px_rgba(255,42,42,0.8)]">CRITICAL THREAT DETECTED</span>
                 <span className="text-sm">Consult Agent Panel immediately.</span>
              </>
          ) : (
              // IDLE STATE
              <>
                 <Radar className="w-12 h-12 opacity-40" />
                 <span className="opacity-60">System Ready. Awaiting Sensor Input.</span>
              </>
          )}
       </div>

       {/* Scanning Line Animation (Only when loading) */}
       {loading && (
         <div className="absolute inset-0 bg-linear-to-b from-transparent via-neon-blue/20 to-transparent h-[20%] w-full animate-[scan_2s_linear_infinite] pointer-events-none"></div>
       )}

       {/* Critical Red Pulse Background */}
       {isCritical && !loading && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-neon-red/30 blur-[100px] rounded-full animate-pulse pointer-events-none"></div>
       )}
    </div>
  );
};

// Add custom animation for the scanline in globals.css if you want, or rely on tailwind defaults.
// For simplicity here, I used standard tailwind animations where possible.

export default MapPlaceholder;