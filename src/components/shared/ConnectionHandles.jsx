import React from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * Reusable bidirectional connection handles
 * All nodes use the same pattern: source + target on all 4 sides
 */
export const ConnectionHandles = ({ variant = 'bar', color = 'indigo' }) => {
  // Handle styling based on variant
  const getHandleClass = (position) => {
    if (variant === 'dot') {
      // Small circular handles (for Projects)
      return `!bg-white !w-5 !h-5 !border-4 !border-${color}-500 !shadow-md !shadow-${color}-500/30 !rounded-full`;
    } else if (variant === 'small-dot') {
      // Tiny circular handles (for Functions)
      return `!w-3 !h-3 !bg-${color}-400 !border-2 !border-white !shadow-md !shadow-${color}-500/30 !rounded-full`;
    } else {
      // Bar handles (for Components and Files)
      const isHorizontal = position === Position.Top || position === Position.Bottom;
      if (isHorizontal) {
        return `!w-24 !h-2 !bg-gradient-to-r from-transparent via-${color}-400 to-transparent !rounded-full !border-none !shadow-sm !shadow-${color}-500/20`;
      } else {
        return `!w-2 !h-16 !bg-gradient-to-b from-transparent via-${color}-400 to-transparent !rounded-full !border-none !shadow-sm !shadow-${color}-500/20`;
      }
    }
  };

  const positions = [Position.Top, Position.Bottom, Position.Left, Position.Right];
  const offset = variant === 'bar' ? (position => position === Position.Top ? '!-top-1' : position === Position.Bottom ? '!-bottom-1' : position === Position.Left ? '!-left-1' : '!-right-1') : () => '';

  return (
    <>
      {positions.map((position) => (
        <React.Fragment key={position}>
          <Handle
            type="source"
            position={position}
            id={`${position}-source`}
            className={`${getHandleClass(position)} ${offset(position)}`}
            isConnectable={true}
          />
          <Handle
            type="target"
            position={position}
            id={`${position}-target`}
            className={`${getHandleClass(position)} ${offset(position)}`}
            isConnectable={true}
          />
        </React.Fragment>
      ))}
    </>
  );
};
