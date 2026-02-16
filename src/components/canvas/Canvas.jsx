import React from 'react';
import { ReactFlow, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { REACT_FLOW_CONFIG, BACKGROUND_CONFIG, MINIMAP_CONFIG, NODE_COLORS } from '../../utils/constants';
import { ZoomControls }    from '../Panels/ZoomControls';
import { SearchPanel }     from '../Panels/SearchPanel';
import { SmartEdge }       from '../edges/SmartEdge';
import { useDagreLayout }  from '../../hooks/useDagreLayout';

const edgeTypes = { smart: SmartEdge };

// Inner component — lives inside ReactFlow provider so hooks work
const CanvasInner = ({
  canUndo, canRedo, onUndo, onRedo,
  onAddProject, onAddComponent,
  nodes, searchOpen, onSearchClose,
}) => {
  const { tidyLayout } = useDagreLayout();

  return (
    <>
      <Background
        color={BACKGROUND_CONFIG.color}
        variant={BACKGROUND_CONFIG.variant}
        gap={BACKGROUND_CONFIG.gap}
        size={BACKGROUND_CONFIG.size}
      />

      <ZoomControls
        canUndo={canUndo} canRedo={canRedo}
        onUndo={onUndo}   onRedo={onRedo}
        onAddProject={onAddProject}
        onAddComponent={onAddComponent}
        onTidyLayout={tidyLayout}
      />

      <MiniMap
        position="bottom-left"
        nodeColor={(node) => NODE_COLORS[node.type]?.primary || '#525252'}
        maskColor={MINIMAP_CONFIG.maskColor}
        zoomable
        pannable
      />

      <SearchPanel
        nodes={nodes}
        isOpen={searchOpen}
        onClose={onSearchClose}
      />
    </>
  );
};

export const Canvas = ({
  nodes, edges,
  onNodesChange, onEdgesChange,
  onConnect, onNodeClick, onPaneClick,
  nodeTypes,
  canUndo, canRedo, onUndo, onRedo,
  searchOpen, onSearchClose,
  onAddProject, onAddComponent,
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
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.08, duration: 400 }}
        elevateEdgesOnSelect
        colorMode={REACT_FLOW_CONFIG.colorMode}
        className="react-flow-custom"
        connectionRadius={REACT_FLOW_CONFIG.connectionRadius}
        snapToGrid={REACT_FLOW_CONFIG.snapToGrid}
        snapGrid={REACT_FLOW_CONFIG.snapGrid}
        defaultEdgeOptions={{ type: 'smart' }}
        minZoom={0.1}
        maxZoom={2}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        zoomOnDoubleClick={false}
        selectionOnDrag={true}
        selectionMode="partial"
      >
        <CanvasInner
          canUndo={canUndo} canRedo={canRedo}
          onUndo={onUndo}   onRedo={onRedo}
          onAddProject={onAddProject}
          onAddComponent={onAddComponent}
          nodes={nodes}
          searchOpen={searchOpen}
          onSearchClose={onSearchClose}
        />
      </ReactFlow>
    </div>
  );
};