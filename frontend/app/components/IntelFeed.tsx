import React from 'react';
import { Radio, Camera, AlertTriangle } from 'lucide-react';

// Mock data structure matching our backend
interface IntelItem {
  id: string;
  type: string;
  description: string;
  time: string;
}

const IntelFeed = ({ items }: { items: IntelItem[] }) => {
  return (
    <div className="h-full flex flex-col bg-black/40 border-r border-gray-800 p-4 backdrop-blur-sm">
      <h2 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2 tracking-widest uppercase">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        Live Perception Stream
      </h2>

      <div className="space-y-3 overflow-y-auto pr-2">
        {items.length === 0 && (
          <p className="text-xs text-gray-600 italic">Waiting for signal...</p>
        )}
        
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className="group relative p-3 border-l-2 border-red-500 bg-gray-900/50 hover:bg-gray-800 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] text-red-400 font-bold">{item.time}</span>
              {item.type === 'audio' ? <Radio size={14} className="text-blue-400"/> : <Camera size={14} className="text-green-400"/>}
            </div>
            <p className="text-xs text-gray-300 font-mono leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntelFeed;