import React from 'react';
import { ReactFlow, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { REACT_FLOW_CONFIG, BACKGROUND_CONFIG, MINIMAP_CONFIG, NODE_COLORS } from '../../utils/constants';
import { ZoomControls } from '../Panels/ZoomControls';

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
        fitViewOptions={{ padding: 0.08, duration: 400 }}
        colorMode={REACT_FLOW_CONFIG.colorMode}
        className="react-flow-custom"
        connectionRadius={REACT_FLOW_CONFIG.connectionRadius}
        snapToGrid={REACT_FLOW_CONFIG.snapToGrid}
        snapGrid={REACT_FLOW_CONFIG.snapGrid}
        defaultEdgeOptions={{ type: REACT_FLOW_CONFIG.defaultEdgeType }}
        // Zoom bounds — prevents getting lost at extreme zoom levels
        minZoom={0.1}
        maxZoom={2}
        // Smooth, controlled scroll zoom
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        zoomOnDoubleClick={false}
        // Multi-select: Shift+click individual nodes, drag empty canvas for box select
        multiSelectionKey="Shift"
        selectionOnDrag={true}
        selectionMode="partial"
      >
        <Background
          color={BACKGROUND_CONFIG.color}
          variant={BACKGROUND_CONFIG.variant}
          gap={BACKGROUND_CONFIG.gap}
          size={BACKGROUND_CONFIG.size}
        />

        {/* Custom zoom controls — replaces the clunky default <Controls> */}
        <ZoomControls />

        <MiniMap
          nodeColor={(node) => NODE_COLORS[node.type]?.primary || '#525252'}
          maskColor={MINIMAP_CONFIG.maskColor}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
};