import React from 'react';
import { FolderGit2, Cpu } from 'lucide-react';

export const ToolbarPanel = ({ onAddProject, onAddComponent }) => {
  return (
    <div className="fixed bottom-6 left-48 z-50 flex items-center gap-2">
      <button
        onClick={onAddProject}
        className="flex items-center gap-2 px-3.5 py-2.5
                   bg-gradient-to-r from-purple-600/90 to-purple-700/90
                   hover:from-purple-500 hover:to-purple-600
                   text-white rounded-xl font-semibold text-sm
                   transition-all active:scale-95
                   shadow-lg shadow-purple-500/20
                   border border-purple-500/30"
      >
        <FolderGit2 size={15} />
        <span>Project</span>
      </button>

      <button
        onClick={onAddComponent}
        className="flex items-center gap-2 px-3.5 py-2.5
                   bg-gradient-to-r from-cyan-600/90 to-teal-600/90
                   hover:from-cyan-500 hover:to-teal-500
                   text-white rounded-xl font-semibold text-sm
                   transition-all active:scale-95
                   shadow-lg shadow-cyan-500/20
                   border border-cyan-500/30"
      >
        <Cpu size={15} />
        <span>Component</span>
      </button>
    </div>
  );
};