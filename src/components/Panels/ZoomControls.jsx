import { useReactFlow, Panel, useViewport } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, LocateFixed } from 'lucide-react';

const ZOOM_STEP  = 0.15;
const ZOOM_MIN   = 0.1;
const ZOOM_MAX   = 2;
const ZOOM_PRESETS = [0.5, 1, 1.5];

export const ZoomControls = () => {
  const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow();
  const { zoom } = useViewport();

  const pct = Math.round(zoom * 100);

  const btnBase = `
    flex items-center justify-center w-8 h-8 rounded-lg
    text-neutral-400 hover:text-white hover:bg-neutral-700/80
    transition-all duration-100 active:scale-90
  `;

  return (
    <Panel position="bottom-right" className="m-4">
      <div className="flex items-center gap-1
                      bg-neutral-900/95 backdrop-blur-xl
                      border border-neutral-700/60 rounded-xl
                      shadow-2xl shadow-black/40 p-1.5">

        {/* Zoom out */}
        <button
          onClick={() => zoomOut({ duration: 150 })}
          disabled={pct <= ZOOM_MIN * 100}
          className={btnBase + ' disabled:opacity-30 disabled:cursor-not-allowed'}
          title="Zoom out  (Ctrl + –)"
        >
          <ZoomOut size={14} />
        </button>

        {/* Zoom level display — click to reset to 100% */}
        <button
          onClick={() => zoomTo(1, { duration: 200 })}
          className="min-w-[52px] h-8 px-2 rounded-lg text-xs font-mono font-bold
                     text-neutral-300 hover:text-white hover:bg-neutral-700/80
                     transition-all duration-100 tabular-nums"
          title="Click to reset to 100%"
        >
          {pct}%
        </button>

        {/* Zoom in */}
        <button
          onClick={() => zoomIn({ duration: 150 })}
          disabled={pct >= ZOOM_MAX * 100}
          className={btnBase + ' disabled:opacity-30 disabled:cursor-not-allowed'}
          title="Zoom in  (Ctrl + =)"
        >
          <ZoomIn size={14} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-neutral-700/80 mx-0.5" />

        {/* Preset buttons */}
        {ZOOM_PRESETS.map(z => (
          <button
            key={z}
            onClick={() => zoomTo(z, { duration: 200 })}
            className={`
              h-8 px-2 rounded-lg text-[11px] font-semibold tabular-nums
              transition-all duration-100 active:scale-90
              ${Math.abs(zoom - z) < 0.02
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-500 hover:text-white hover:bg-neutral-700/80'}
            `}
            title={`Zoom to ${z * 100}%`}
          >
            {z * 100}%
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-5 bg-neutral-700/80 mx-0.5" />

        {/* Fit view */}
        <button
          onClick={() => fitView({ duration: 350, padding: 0.08 })}
          className={btnBase}
          title="Fit all nodes in view"
        >
          <Maximize2 size={13} />
        </button>

      </div>
    </Panel>
  );
};