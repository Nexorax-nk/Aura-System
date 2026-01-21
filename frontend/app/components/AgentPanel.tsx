import React from 'react';
import { ShieldAlert, Brain, FileText, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const AgentPanel = ({ risk, plan, explanation }: any) => {
  if (!risk) return <div className="p-6 text-gray-600 text-sm">System Idle. Awaiting Intel...</div>;

  // Determine Color based on Risk
  const riskColor = risk.level === 'CRITICAL' ? 'text-red-500 border-red-500' : 
                    risk.level === 'HIGH' ? 'text-orange-500 border-orange-500' : 'text-green-500 border-green-500';

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      
      {/* 1. RISK AGENT OUTPUT */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`border p-4 rounded bg-black/50 ${riskColor}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="flex items-center gap-2 font-bold uppercase tracking-widest">
            <ShieldAlert size={18} /> Risk Assessment
          </h3>
          <span className="text-2xl font-black">{risk.level}</span>
        </div>
        <div className="w-full bg-gray-800 h-1 mt-2">
          <div className="bg-current h-full" style={{ width: `${risk.score * 100}%` }}></div>
        </div>
      </motion.div>

      {/* 2. DECISION AGENT PLAN */}
      {plan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="border border-blue-900/50 p-4 rounded bg-blue-900/10">
          <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-3 uppercase text-sm">
            <Zap size={16} /> Recommended Strategy
          </h3>
          <ul className="space-y-2">
            {plan.immediate_actions?.map((action: string, i: number) => (
              <li key={i} className="text-sm text-gray-200 flex gap-2">
                <span className="text-blue-500">Wait {i+1}.</span> {action}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* 3. EXPLAINABILITY AGENT */}
      {explanation && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="border border-gray-700 p-4 rounded bg-gray-900">
          <h3 className="text-gray-400 font-bold flex items-center gap-2 mb-2 uppercase text-xs">
            <Brain size={14} /> Agent Reasoning
          </h3>
          <p className="text-sm text-gray-300 italic border-l-2 border-gray-600 pl-3">
            "{explanation.narrative}"
          </p>
        </motion.div>
      )}

    </div>
  );
};

export default AgentPanel;