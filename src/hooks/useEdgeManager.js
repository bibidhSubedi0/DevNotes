import { useCallback } from 'react';
import { addEdge, MarkerType } from '@xyflow/react';
import { EDGE_CONFIGS } from '../utils/constants';

/**
 * Hook for managing edge creation and configuration
 */
export const useEdgeManager = (setEdges, selectedEdgeType) => {
  
  // Handle new connection between nodes
  const handleConnect = useCallback((params) => {
    const edgeConfig = EDGE_CONFIGS[selectedEdgeType];
    
    const newEdge = { 
      ...params, 
      type: 'smart',
      animated: edgeConfig.animated, 
      data:  { label: edgeConfig.label, color: edgeConfig.color },
      style: { stroke: edgeConfig.color, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: edgeConfig.color },
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges, selectedEdgeType]);

  return {
    handleConnect,
  };
};