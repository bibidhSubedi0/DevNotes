import React, { useState } from 'react';
import { FolderGit2, Package, ChevronUp, ChevronDown, Info } from 'lucide-react';

export const ToolbarPanel = ({ onAddProject, onAddComponent }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Help Tooltip - Only shows when expanded */}
      {isExpanded && (
        <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 rounded-lg px-3 py-2 shadow-xl max-w-[280px] animate-slideUp">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-[11px] text-neutral-300 leading-relaxed">
              <span className="text-purple-400 font-semibold">Projects</span> → <span className="text-amber-400 font-semibold">Components</span> → <span className="text-blue-400 font-semibold">Files</span> → <span className="text-emerald-400 font-semibold">Functions</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons Container */}
      <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Collapsible Buttons */}
        {isExpanded && (
          <div className="flex flex-col gap-1 p-2 border-b border-neutral-700 animate-slideUp">
            <button 
              onClick={onAddProject}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600/90 to-purple-700/90 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg font-medium text-sm transition-all active:scale-95 shadow-lg shadow-purple-500/20 w-full"
            >
              <FolderGit2 size={16} /> 
              <span>New Project</span>
            </button>
            
            <button 
              onClick={onAddComponent}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600/90 to-orange-600/90 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg font-medium text-sm transition-all active:scale-95 shadow-lg shadow-amber-500/20 w-full"
            >
              <Package size={16} /> 
              <span>New Component</span>
            </button>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all w-full group"
        >
          {isExpanded ? (
            <>
              <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
              <span className="text-xs font-medium">Hide</span>
            </>
          ) : (
            <>
              <ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-xs font-medium">Add Nodes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};