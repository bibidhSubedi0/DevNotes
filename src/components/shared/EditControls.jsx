import React from 'react';
import { Check, X } from 'lucide-react';

/**
 * Reusable edit controls (save/cancel buttons)
 */
export const EditControls = ({ onSave, onCancel, variant = 'default' }) => {
  const sizeClass = variant === 'small' ? 'p-0.5' : 'p-1.5';
  const iconSize = variant === 'small' ? 12 : 14;

  return (
    <div className="flex gap-1 justify-center">
      <button 
        onClick={onSave} 
        className={`${sizeClass} bg-green-500 hover:bg-green-400 rounded text-white transition-colors`}
      >
        <Check size={iconSize} />
      </button>
      <button 
        onClick={onCancel} 
        className={`${sizeClass} bg-red-500 hover:bg-red-400 rounded text-white transition-colors`}
      >
        <X size={iconSize} />
      </button>
    </div>
  );
};
