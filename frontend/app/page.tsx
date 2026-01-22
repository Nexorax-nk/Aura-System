'use client';
import { useState } from 'react';
import axios from 'axios';
import IntelFeed from './components/IntelFeed';
import AgentPanel from './components/AgentPanel';
import MapView from './components/MapView'; 
import { UploadCloud, Radio, Activity } from 'lucide-react';

export default function Dashboard() {
  const [intelItems, setIntelItems] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [explainData, setExplainData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'image') => {
    if (!event.target.files?.[0]) return;
    setLoading(true);

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('location', 'Sector 4');

    try {
        // 1. INGEST (Perception Agent)
        const ingestRes = await axios.post('http://localhost:8000/ingest', formData);
        const newIntel = {
            id: ingestRes.data.id,
            type: type,
            description: ingestRes.data.intel,
            time: new Date().toLocaleTimeString(),
        };
        setIntelItems((prev) => [newIntel, ...prev]);

        // 2. MEMORY SEARCH (Memory Agent)
        const memoryRes = await axios.get(`http://localhost:8000/agent/memory?query=${newIntel.description}`);
        const similarIncidents = memoryRes.data.data;

        // 3. RISK ASSESSMENT (Risk Agent)
        const riskRes = await axios.post('http://localhost:8000/agent/risk', { similar_incidents: similarIncidents });
        setRiskData(riskRes.data.data);

        // 4. GENERATE PLAN (Decision Agent)
        const decisionRes = await axios.post('http://localhost:8000/agent/decision', {
            current_description: newIntel.description,
            risk_data: riskRes.data.data,
            past_incidents: similarIncidents
        });
        setPlanData(decisionRes.data.data);

        // 5. EXPLAIN (Explainability Agent)
        const explainRes = await axios.post('http://localhost:8000/agent/explain', {
            plan: decisionRes.data.data,
            risk_data: riskRes.data.data,
            past_incidents: similarIncidents
        });
        setExplainData(explainRes.data.data);

        // --- MOCK DATA FOR VISUAL DEMO (Remove this in production) ---
        setTimeout(() => {
            setRiskData({ level: 'CRITICAL', score: 0.95 });
            setPlanData({ immediate_actions: ["Evacuate Sector 4", "Cut Power Grid B"] });
        }, 1500);

    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden selection:bg-neon-blue selection:text-black">
      
      {/* LAYER 0: MAP (Crystal Clear - No Opacity Reduction) */}
      <div className="absolute inset-0 z-0">
         <MapView riskLevel={riskData?.level} />
      </div>

      {/* LAYER 1: Minimal Vignette (Only for text readability at very edges) */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.8)_100%)]"></div>

      {/* LAYER 2: HUD */}
      <div className="relative z-20 w-full h-full flex flex-col p-6 pointer-events-none">
        
        {/* HEADER */}
        <header className="flex items-center justify-between mb-6 pointer-events-auto">
          {/* Brand */}
          <div className="flex items-center gap-4 bg-black/40 border border-white/10 backdrop-blur-md px-6 py-3 rounded-br-2xl shadow-xl">
            <div className={`w-3 h-3 rounded-full ${riskData?.level === 'CRITICAL' ? 'bg-neon-red animate-ping' : 'bg-green-500'}`}></div>
            <h1 className="text-2xl font-bold tracking-[0.2em] text-white flex items-center gap-2">
              AURA <span className="text-neon-blue text-xs border border-neon-blue px-1 rounded">OS v2.0</span>
            </h1>
          </div>

          {/* Status Ticker */}
          <div className="hidden md:flex items-center gap-8 text-xs font-mono text-gray-300 bg-black/60 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
            <span className="flex items-center gap-2">
                <Radio size={14} className="text-neon-blue" /> SYSTEM: ONLINE
            </span>
            <span className="flex items-center gap-2">
                <Activity size={14} className={loading ? "text-neon-red animate-pulse" : "text-green-500"} /> 
                STATUS: {loading ? "ANALYZING..." : "STANDING BY"}
            </span>
            <span>LOC: 40.7128° N, 74.0060° W</span>
          </div>

          {/* Upload Buttons */}
          <div className="flex gap-3">
             <label className="cursor-pointer group relative overflow-hidden bg-black/40 border border-neon-blue/30 hover:border-neon-blue text-neon-blue px-6 py-3 transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] backdrop-blur-md">
               <span className="relative z-10 flex items-center gap-2 font-bold text-sm tracking-widest"><UploadCloud size={18}/> AUDIO</span>
               <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleUpload(e, 'audio')} />
             </label>
             <label className="cursor-pointer group relative overflow-hidden bg-black/40 border border-neon-red/30 hover:border-neon-red text-neon-red px-6 py-3 transition-all hover:shadow-[0_0_20px_rgba(255,42,42,0.3)] backdrop-blur-md">
               <span className="relative z-10 flex items-center gap-2 font-bold text-sm tracking-widest"><UploadCloud size={18}/> VISUAL</span>
               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'image')} />
             </label>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          
          {/* LEFT PANEL */}
          <div className="w-80 flex flex-col pointer-events-auto transition-all duration-500 hover:w-96">
            <div className="flex-1 bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-xl overflow-hidden relative shadow-2xl flex flex-col">
               <h3 className="text-neon-blue text-[10px] font-bold tracking-[0.2em] mb-4 border-b border-white/10 pb-2 uppercase flex justify-between shrink-0">
                  Incoming Intel
                  <span className="animate-pulse">●</span>
               </h3>
               <div className="overflow-y-auto h-full scrollbar-hide">
                 <IntelFeed items={intelItems} />
               </div>
            </div>
          </div>

          {/* CENTER: Empty for Map Visibility */}
          <div className="flex-1 relative"></div>

          {/* RIGHT PANEL */}
          <div className="w-96 flex flex-col pointer-events-auto">
             <div className="flex-1 bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-xl overflow-y-auto relative shadow-2xl">
                <h3 className="text-neon-red text-[10px] font-bold tracking-[0.2em] mb-4 border-b border-white/10 pb-2 uppercase flex justify-between shrink-0">
                   Analysis Engine
                   <span className="animate-pulse">●</span>
                </h3>
                <AgentPanel risk={riskData} plan={planData} explanation={explainData} />
             </div>
          </div>

        </div>

        {/* FOOTER */}
        <footer className="mt-4 flex justify-between items-end opacity-70 text-[10px] uppercase tracking-widest pointer-events-auto text-gray-400">
           <div><p>Memory Usage: 14%</p></div>
           <div className="flex gap-4"><span>SECURE CONNECTION</span><span className="text-neon-blue">ENCRYPTED</span></div>
        </footer>
      
      </div>
    </main>
  );
}