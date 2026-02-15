import React from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { REACT_FLOW_CONFIG, BACKGROUND_CONFIG, MINIMAP_CONFIG, NODE_COLORS } from '../../utils/constants';

export const Canvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  nodeTypes,
}) => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        colorMode={REACT_FLOW_CONFIG.colorMode}
        className="react-flow-custom"
        connectionRadius={REACT_FLOW_CONFIG.connectionRadius}
        snapToGrid={REACT_FLOW_CONFIG.snapToGrid}
        snapGrid={REACT_FLOW_CONFIG.snapGrid}
        defaultEdgeOptions={{ type: REACT_FLOW_CONFIG.defaultEdgeType }}
      >
        <Background
          color={BACKGROUND_CONFIG.color}
          variant={BACKGROUND_CONFIG.variant}
          gap={BACKGROUND_CONFIG.gap}
          size={BACKGROUND_CONFIG.size}
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => NODE_COLORS[node.type]?.primary || '#525252'}
          maskColor={MINIMAP_CONFIG.maskColor}
        />
      </ReactFlow>
    </div>
  );
};