import React, { useEffect } from 'react';
import { ReactFlow, Background, MiniMap, Panel, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, LayoutDashboard } from 'lucide-react';
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
  onReady,
}) => {
  const { tidyLayout, alignRow, alignColumn } = useDagreLayout();
  const { screenToFlowPosition } = useReactFlow();

  // Expose screenToFlowPosition to App (which lives outside the RF provider)
  useEffect(() => {
    onReady?.(screenToFlowPosition);
  }, [screenToFlowPosition, onReady]);

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

      {/* ── Geometry / Alignment toolbar ── */}
      <Panel position="bottom-center" style={{ marginBottom: '24px' }}>
        <div className="flex items-center gap-1 px-2 py-1.5
                        bg-neutral-900/95 backdrop-blur-xl
                        border border-neutral-700/50 rounded-xl
                        shadow-lg shadow-black/40">
          <span className="text-[11px] text-neutral-600 font-medium px-1.5 select-none">Arrange</span>
          <div className="w-px h-4 bg-neutral-800 mx-0.5" />
          <button
            onClick={alignRow}
            title="Align all nodes in a horizontal row"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                       text-neutral-400 hover:text-white hover:bg-neutral-800
                       transition-all active:scale-95"
          >
            <AlignHorizontalJustifyCenter size={14} />
            <span>Row</span>
          </button>
          <button
            onClick={alignColumn}
            title="Align all nodes in a vertical column"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                       text-neutral-400 hover:text-white hover:bg-neutral-800
                       transition-all active:scale-95"
          >
            <AlignVerticalJustifyCenter size={14} />
            <span>Column</span>
          </button>
          <div className="w-px h-4 bg-neutral-800 mx-0.5" />
          <button
            onClick={tidyLayout}
            title="Auto-layout using dependency graph (Dagre)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                       text-neutral-400 hover:text-white hover:bg-neutral-800
                       transition-all active:scale-95"
          >
            <LayoutDashboard size={14} />
            <span>Auto Layout</span>
          </button>
        </div>
      </Panel>

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
  onReady,
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
          onReady={onReady}
        />
      </ReactFlow>
    </div>
  );
};