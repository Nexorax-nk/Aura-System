'use client';
import { useState } from 'react';
import axios from 'axios';
import IntelFeed from './components/IntelFeed';
import AgentPanel from './components/AgentPanel';
import { UploadCloud } from 'lucide-react';

export default function Dashboard() {
  const [intelItems, setIntelItems] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [explainData, setExplainData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // --- THE "BIG RED BUTTON" LOGIC ---
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'image') => {
    if (!event.target.files?.[0]) return;
    setLoading(true);

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('location', 'Sector 4 (North Wing)');

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

    } catch (error) {
      console.error("System Failure:", error);
      alert("Agent Communication Failed. Check Console.");
    }
    setLoading(false);
  };

  return (
    <main className="flex h-screen w-screen bg-black text-white overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* LEFT: Intel Feed */}
      <div className="w-80 h-full border-r border-gray-800 z-10">
        <IntelFeed items={intelItems} />
      </div>

      {/* CENTER: Map / Command */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-black/80">
          <h1 className="text-xl font-bold tracking-widest text-white flex items-center gap-3">
            <span className="text-red-600 text-2xl">AURA</span> 
            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">CRISIS OS v1.0</span>
          </h1>
          <div className="flex gap-4">
            {/* UPLOAD BUTTONS */}
            <label className="cursor-pointer bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 px-4 py-2 rounded border border-blue-800 flex items-center gap-2 text-sm transition-all">
              <UploadCloud size={16}/> Upload Audio
              <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleUpload(e, 'audio')} />
            </label>
            <label className="cursor-pointer bg-red-900/30 hover:bg-red-800/50 text-red-400 px-4 py-2 rounded border border-red-800 flex items-center gap-2 text-sm transition-all">
              <UploadCloud size={16}/> Upload Image
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'image')} />
            </label>
          </div>
        </header>

        {/* Map Placeholder */}
        <div className="flex-1 bg-gray-900/30 flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-10 grayscale invert"></div>
          {loading && <div className="text-red-500 font-mono animate-pulse text-xl">ANALYZING DATA STREAMS...</div>}
          {!loading && !riskData && <div className="text-gray-600 font-mono">SYSTEM READY. AWAITING INPUT.</div>}
          
          {/* Central Pulse if Critical */}
          {riskData?.level === 'CRITICAL' && (
            <div className="absolute w-32 h-32 bg-red-500/20 rounded-full animate-ping"></div>
          )}
        </div>
      </div>

      {/* RIGHT: Agent Analysis */}
      <div className="w-96 h-full border-l border-gray-800 bg-black/90 z-10">
        <AgentPanel risk={riskData} plan={planData} explanation={explainData} />
      </div>
    </main>
  );
}