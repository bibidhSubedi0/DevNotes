import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Zap } from 'lucide-react';
import { EDGE_CONFIGS } from '../../utils/constants';

export const EdgeTypeSelector = ({ selectedEdgeType, onEdgeTypeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedConfig = EDGE_CONFIGS[selectedEdgeType];

  return (
    <div ref={dropdownRef} className="fixed top-30 right-10 z-40">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2
                   bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/60
                   rounded-xl text-sm text-neutral-300 hover:text-white
                   transition-all shadow-lg shadow-black/20"
      >
        <Zap size={13} className="text-amber-400" />
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-0.5 rounded-full" 
            style={{ backgroundColor: selectedConfig.color }}
          />
          <span className="text-xs font-medium">{selectedConfig.label}</span>
        </div>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48
                        bg-neutral-900/98 backdrop-blur-xl border border-neutral-700/80
                        rounded-xl shadow-2xl shadow-black/40 overflow-hidden
                        animate-in fade-in slide-in-from-top-2 duration-150">
          {Object.entries(EDGE_CONFIGS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => {
                onEdgeTypeChange(key);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left
                          transition-colors
                          ${selectedEdgeType === key 
                            ? 'bg-neutral-800 text-white' 
                            : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                          }`}
            >
              <div 
                className="w-8 h-0.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs font-medium">{config.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};