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
      type: 'smoothstep',
      animated: edgeConfig.animated, 
      label: edgeConfig.label,
      style: { stroke: edgeConfig.color, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: edgeConfig.color },
      labelStyle: { fill: edgeConfig.color, fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: '#171717', fillOpacity: 0.9 }
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges, selectedEdgeType]);

  return {
    handleConnect,
  };
};
