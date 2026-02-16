import { useReactFlow, Panel, useViewport } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2, FolderGit2, Cpu, LayoutGrid } from 'lucide-react';

const ZOOM_MIN    = 0.1;
const ZOOM_MAX    = 2;
const ZOOM_PRESETS = [0.5, 1, 1.5];

const Btn = ({ onClick, disabled, title, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="flex items-center justify-center w-8 h-8 rounded-lg
               text-neutral-400 hover:text-white hover:bg-neutral-700/80
               transition-all duration-100 active:scale-90
               disabled:opacity-25 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-neutral-700/60 mx-0.5" />;

export const ZoomControls = ({ canUndo, canRedo, onUndo, onRedo, onAddProject, onAddComponent, onTidyLayout }) => {
  const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const pct = Math.round(zoom * 100);

  return (
    <Panel position="bottom-right" className="m-4">
      <div className="flex items-center gap-0.5
                      bg-neutral-900/95 backdrop-blur-xl
                      border border-neutral-700/60 rounded-xl
                      shadow-2xl shadow-black/40 p-1.5">

        {/* Add nodes */}
        <Btn onClick={onAddProject} title="Add Project">
          <FolderGit2 size={14} />
        </Btn>
        <Btn onClick={onAddComponent} title="Add Component">
          <Cpu size={14} />
        </Btn>

        <Divider />

        {/* Undo / Redo */}
        <Btn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo2 size={14} />
        </Btn>
        <Btn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <Redo2 size={14} />
        </Btn>

        <Divider />

        {/* Zoom out */}
        <Btn onClick={() => zoomOut({ duration: 150 })} disabled={pct <= ZOOM_MIN * 100} title="Zoom out (Ctrl+–)">
          <ZoomOut size={14} />
        </Btn>

        {/* Zoom % — click to reset to 100% */}
        <button
          onClick={() => zoomTo(1, { duration: 200 })}
          title="Click to reset to 100%"
          className="min-w-[48px] h-8 px-2 rounded-lg text-xs font-mono font-bold
                     text-neutral-300 hover:text-white hover:bg-neutral-700/80
                     transition-all duration-100 tabular-nums"
        >
          {pct}%
        </button>

        {/* Zoom in */}
        <Btn onClick={() => zoomIn({ duration: 150 })} disabled={pct >= ZOOM_MAX * 100} title="Zoom in (Ctrl+=)">
          <ZoomIn size={14} />
        </Btn>

        <Divider />

        {/* Zoom presets */}
        {ZOOM_PRESETS.map(z => (
          <button
            key={z}
            onClick={() => zoomTo(z, { duration: 200 })}
            title={`Zoom to ${z * 100}%`}
            className={`h-8 px-2 rounded-lg text-[11px] font-semibold tabular-nums
                        transition-all duration-100 active:scale-90
                        ${Math.abs(zoom - z) < 0.02
                          ? 'bg-neutral-700 text-white'
                          : 'text-neutral-500 hover:text-white hover:bg-neutral-700/80'}`}
          >
            {z * 100}%
          </button>
        ))}

        <Divider />

        {/* Fit view */}
        <Btn onClick={() => fitView({ duration: 350, padding: 0.08 })} title="Fit view">
          <Maximize2 size={13} />
        </Btn>

        <Divider />

        {/* Tidy layout */}
        <Btn onClick={onTidyLayout} title="Auto-arrange nodes (Dagre LR layout)">
          <LayoutGrid size={13} />
        </Btn>

      </div>
    </Panel>
  );
};