import { useReactFlow, Panel, useViewport } from '@xyflow/react';
import {
  ZoomIn, ZoomOut, Maximize2, Undo2, Redo2,
  FolderGit2, Cpu, LayoutGrid,
  AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter,
  ChevronDown, Zap,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { EDGE_CONFIGS } from '../../utils/constants';

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 2;

const Btn = ({ onClick, disabled, title, children, active }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`flex items-center justify-center w-8 h-8 rounded-lg
               transition-all duration-100 active:scale-90
               disabled:opacity-25 disabled:cursor-not-allowed
               ${active
                 ? 'bg-neutral-700 text-white'
                 : 'text-neutral-400 hover:text-white hover:bg-neutral-700/80'}`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-neutral-700/60 mx-0.5 flex-shrink-0" />;

export const ZoomControls = ({
  canUndo, canRedo, onUndo, onRedo,
  onAddProject, onAddComponent,
  onTidyLayout, onAlignRow, onAlignColumn,
  selectedEdgeType, onEdgeTypeChange,
}) => {
  const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const pct = Math.round(zoom * 100);

  const [edgeOpen, setEdgeOpen] = useState(false);
  const edgeRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (edgeRef.current && !edgeRef.current.contains(e.target)) setEdgeOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedConfig = EDGE_CONFIGS[selectedEdgeType];

  return (
    <Panel position="bottom-right" className="m-4">
      <div className="flex items-center gap-0.5
                      bg-neutral-900/95 backdrop-blur-xl
                      border border-neutral-700/60 rounded-xl
                      shadow-2xl shadow-black/40 p-1.5">

        {/* Add nodes */}
        <Btn onClick={onAddProject} title="Add Project"><FolderGit2 size={14} /></Btn>
        <Btn onClick={onAddComponent} title="Add Component"><Cpu size={14} /></Btn>

        <Divider />

        {/* Undo / Redo */}
        <Btn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)"><Undo2 size={14} /></Btn>
        <Btn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)"><Redo2 size={14} /></Btn>

        <Divider />

        {/* Arrange */}
        <Btn onClick={onAlignRow}    title="Align in a row"><AlignHorizontalJustifyCenter size={14} /></Btn>
        <Btn onClick={onAlignColumn} title="Align in a column"><AlignVerticalJustifyCenter size={14} /></Btn>
        <Btn onClick={onTidyLayout}  title="Auto-layout"><LayoutGrid size={13} /></Btn>

        <Divider />

        {/* Zoom */}
        <Btn onClick={() => zoomOut({ duration: 150 })} disabled={pct <= ZOOM_MIN * 100} title="Zoom out">
          <ZoomOut size={14} />
        </Btn>
        <button
          onClick={() => zoomTo(1, { duration: 200 })}
          title="Reset to 100%"
          className="min-w-[44px] h-8 px-2 rounded-lg text-xs font-mono font-bold
                     text-neutral-300 hover:text-white hover:bg-neutral-700/80
                     transition-all tabular-nums"
        >
          {pct}%
        </button>
        <Btn onClick={() => zoomIn({ duration: 150 })} disabled={pct >= ZOOM_MAX * 100} title="Zoom in">
          <ZoomIn size={14} />
        </Btn>
        <Btn onClick={() => fitView({ duration: 350, padding: 0.08 })} title="Fit view">
          <Maximize2 size={13} />
        </Btn>

        <Divider />

        {/* Edge type */}
        <div ref={edgeRef} className="relative">
          <button
            onClick={() => setEdgeOpen(o => !o)}
            title="Edge type for new connections"
            className="flex items-center gap-1.5 h-8 px-2 rounded-lg
                       text-neutral-400 hover:text-white hover:bg-neutral-700/80 transition-all"
          >
            <Zap size={12} className="text-amber-400 flex-shrink-0" />
            <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: selectedConfig?.color }} />
            <ChevronDown size={11} className={`transition-transform ${edgeOpen ? 'rotate-180' : ''}`} />
          </button>

          {edgeOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-44
                            bg-neutral-900/98 backdrop-blur-xl border border-neutral-700/80
                            rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
              {Object.entries(EDGE_CONFIGS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => { onEdgeTypeChange(key); setEdgeOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                              ${selectedEdgeType === key
                                ? 'bg-neutral-800 text-white'
                                : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'}`}
                >
                  <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="text-xs font-medium">{config.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </Panel>
  );
};