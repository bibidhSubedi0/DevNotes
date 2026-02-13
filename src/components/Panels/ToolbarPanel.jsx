import React from 'react';
import { FolderGit2, Package } from 'lucide-react';

export const ToolbarPanel = ({ onAddProject, onAddComponent }) => {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
      {/* Instructions */}
      <div className="bg-neutral-800/95 backdrop-blur-xl border border-neutral-600 rounded-lg px-4 py-2 shadow-xl">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-neutral-300">
            <strong className="text-purple-400">Projects</strong> connect to <strong className="text-amber-400">Components</strong>
          </span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-300">
            <strong className="text-amber-400">Components</strong> contain <strong className="text-blue-400">Files</strong> contain <strong className="text-emerald-400">Functions</strong>
          </span>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex gap-2 p-2.5 bg-neutral-800/95 backdrop-blur-xl border border-neutral-600 rounded-2xl shadow-2xl">
        <button 
          onClick={onAddProject}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-medium text-sm transition-all active:scale-95 shadow-lg shadow-purple-500/20"
        >
          <FolderGit2 size={16} /> 
          <span>New Project</span>
        </button>
        
        <button 
          onClick={onAddComponent}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-medium text-sm transition-all active:scale-95 shadow-lg shadow-amber-500/20"
        >
          <Package size={16} /> 
          <span>New Component</span>
        </button>
      </div>
    </div>
  );
};
