import React from 'react';
import { Panel } from '@xyflow/react';
import { Layers, GitBranch } from 'lucide-react';

export const StatsPanel = ({ nodes, edges }) => {
  return (
    <Panel position="top-left" className="m-4">
      <div className="bg-neutral-800/95 backdrop-blur-xl border border-neutral-600 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-indigo-400" />
            <div>
              <div className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider">Nodes</div>
              <div className="text-xl font-bold text-white">{nodes.length}</div>
            </div>
          </div>
          <div className="w-px h-10 bg-neutral-600" />
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-purple-400" />
            <div>
              <div className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider">Connections</div>
              <div className="text-xl font-bold text-white">{edges.length}</div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};
