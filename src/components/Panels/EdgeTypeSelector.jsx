import React from 'react';
import { Panel } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { EDGE_CONFIGS } from '../../utils/constants';

export const EdgeTypeSelector = ({ selectedEdgeType, onEdgeTypeChange }) => {
  return (
    <Panel position="top-right" className="m-4">
      <div className="bg-neutral-800/95 backdrop-blur-xl border border-neutral-600 rounded-xl p-3 shadow-2xl">
        <div className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider mb-2 flex items-center gap-1.5">
          <Zap size={12} className="text-amber-400" />
          Connection Type
        </div>
        <div className="flex flex-col gap-1.5">
          {Object.entries(EDGE_CONFIGS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => onEdgeTypeChange(key)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left
                ${selectedEdgeType === key 
                  ? 'bg-neutral-600 text-white shadow-sm' 
                  : 'bg-transparent text-neutral-300 hover:bg-neutral-700/50 hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-0.5 rounded-full" 
                  style={{ backgroundColor: config.color }}
                />
                <span>{config.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
};
