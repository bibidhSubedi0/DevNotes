import React, { useState } from 'react';
import { FolderGit2, Cpu, ChevronUp, ChevronDown } from 'lucide-react';

export const ToolbarPanel = ({ onAddProject, onAddComponent }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 left-48 z-50 flex flex-col items-start gap-2">

      {/* Action buttons — slide up when expanded */}
      {isExpanded && (
        <div className="flex items-center gap-2 animate-slideUp">
          <button
            onClick={() => { onAddProject(); setIsExpanded(false); }}
            className="flex items-center gap-2 px-3 py-2
                       bg-gradient-to-r from-purple-600/90 to-purple-700/90
                       hover:from-purple-500 hover:to-purple-600
                       text-white rounded-xl font-medium text-sm
                       transition-all active:scale-95
                       shadow-lg shadow-purple-500/20"
          >
            <FolderGit2 size={15} />
            <span>Project</span>
          </button>

          <button
            onClick={() => { onAddComponent(); setIsExpanded(false); }}
            className="flex items-center gap-2 px-3 py-2
                       bg-gradient-to-r from-cyan-600/90 to-teal-600/90
                       hover:from-cyan-500 hover:to-teal-500
                       text-white rounded-xl font-medium text-sm
                       transition-all active:scale-95
                       shadow-lg shadow-cyan-500/20"
          >
            <Cpu size={15} />
            <span>Component</span>
          </button>
        </div>
      )}

      {/*
      { Toggle}
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="flex items-center gap-2 px-3 py-2
                   bg-neutral-900/95 backdrop-blur-xl
                   border border-neutral-700/60 rounded-xl
                   text-neutral-400 hover:text-white
                   transition-all shadow-lg shadow-black/30
                   hover:border-neutral-600"
      >
        {isExpanded
          ? <ChevronDown size={14} className="transition-transform" />
          : <ChevronUp   size={14} className="transition-transform" />
        }
        { <span className="text-xs font-medium">Add Node</span> }
      </button> */}
    </div>
  );
};