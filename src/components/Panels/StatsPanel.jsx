import { Panel } from '@xyflow/react';
import { FolderGit2, Box, FileCode, Code2, AlertTriangle, Activity } from 'lucide-react';
import { useState } from 'react';

const COMPLEXITY_COLORS = {
  high:   { bar: 'bg-red-500',    text: 'text-red-400'    },
  medium: { bar: 'bg-amber-500',  text: 'text-amber-400'  },
  low:    { bar: 'bg-emerald-500',text: 'text-emerald-400' },
};

const MiniBar = ({ value, max, color }) => (
  <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-500 ${color}`}
      style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
    />
  </div>
);

export const StatsPanel = ({ nodes, edges }) => {
  const [expanded, setExpanded] = useState(false);

  // ── Compute stats ──────────────────────────────────────────────────────
  const projects    = nodes.filter(n => n.type === 'project');
  const components  = nodes.filter(n => n.type === 'component');
  const files       = nodes.filter(n => n.type === 'file');
  const functions   = nodes.filter(n => n.type === 'function');

  const highFns   = functions.filter(f => f.data?.complexity === 'high');
  const medFns    = functions.filter(f => f.data?.complexity === 'medium');
  const lowFns    = functions.filter(f => f.data?.complexity === 'low');
  const unknownFns = functions.filter(f => !f.data?.complexity);

  const withDesc   = functions.filter(f => f.data?.description?.trim()).length;
  const coverage   = functions.length > 0 ? Math.round((withDesc / functions.length) * 100) : 0;

  // Most connected component (by edge count)
  const edgeCounts = {};
  edges.forEach(e => {
    edgeCounts[e.source] = (edgeCounts[e.source] || 0) + 1;
    edgeCounts[e.target] = (edgeCounts[e.target] || 0) + 1;
  });
  const busiest = Object.entries(edgeCounts).sort((a, b) => b[1] - a[1])[0];
  const busiestNode = busiest ? nodes.find(n => n.id === busiest[0]) : null;

  const hasWarnings = highFns.length > 0;

  // ── Collapsed pill ─────────────────────────────────────────────────────
  const pill = (
    <button
      onClick={() => setExpanded(true)}
      className="flex items-center gap-3 px-4 py-2.5
                 bg-neutral-900/95 backdrop-blur-xl
                 border border-neutral-700/60 rounded-xl
                 shadow-2xl shadow-black/30
                 hover:border-neutral-600 transition-colors group"
    >
      {/* Type pills */}
      <span className="flex items-center gap-1 text-xs text-purple-400 font-semibold">
        <FolderGit2 size={12} /> {projects.length}
      </span>
      <span className="flex items-center gap-1 text-xs text-cyan-400 font-semibold">
        <Box size={12} /> {components.length}
      </span>
      <span className="flex items-center gap-1 text-xs text-blue-400 font-semibold">
        <FileCode size={12} /> {files.length}
      </span>
      <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
        <Code2 size={12} /> {functions.length}
      </span>

      <div className="w-px h-4 bg-neutral-700" />

      {/* Coverage */}
      <span className="flex items-center gap-1 text-xs text-neutral-400">
        <Activity size={11} />
        <span className={coverage >= 80 ? 'text-emerald-400' : coverage >= 40 ? 'text-amber-400' : 'text-red-400'}>
          {coverage}%
        </span>
      </span>

      {/* Warnings */}
      {hasWarnings && (
        <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
          <AlertTriangle size={11} /> {highFns.length}
        </span>
      )}
    </button>
  );

  // ── Expanded panel ─────────────────────────────────────────────────────
  const panel = (
    <div className="bg-neutral-900/97 backdrop-blur-xl border border-neutral-700/60
                    rounded-xl shadow-2xl shadow-black/40 w-64 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Project Stats</span>
        <button
          onClick={() => setExpanded(false)}
          className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          collapse
        </button>
      </div>

      <div className="px-4 py-3 space-y-4">

        {/* Node type counts */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Projects',    count: projects.length,   icon: FolderGit2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Components',  count: components.length, icon: Box,        color: 'text-cyan-400',   bg: 'bg-cyan-500/10'   },
            { label: 'Files',       count: files.length,      icon: FileCode,   color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
            { label: 'Functions',   count: functions.length,  icon: Code2,      color: 'text-emerald-400',bg: 'bg-emerald-500/10'},
          ].map(({ label, count, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-lg px-3 py-2 flex items-center gap-2`}>
              <Icon size={13} className={color} />
              <div>
                <div className={`text-lg font-bold leading-none ${color}`}>{count}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Connections */}
        <div className="flex items-center justify-between py-2 border-t border-neutral-800/60">
          <span className="text-xs text-neutral-500">Connections</span>
          <span className="text-sm font-bold text-neutral-300">{edges.length}</span>
        </div>

        {/* Complexity breakdown */}
        {functions.length > 0 && (
          <div className="space-y-2 border-t border-neutral-800/60 pt-3">
            <div className="text-[10px] uppercase text-neutral-600 font-bold tracking-wider">
              Complexity
            </div>
            {[
              { label: 'High',    count: highFns.length,   key: 'high'   },
              { label: 'Medium',  count: medFns.length,    key: 'medium' },
              { label: 'Low',     count: lowFns.length,    key: 'low'    },
            ].map(({ label, count, key }) => (
              <div key={key} className="flex items-center gap-2">
                <span className={`text-[11px] w-12 ${COMPLEXITY_COLORS[key].text}`}>{label}</span>
                <MiniBar value={count} max={functions.length} color={COMPLEXITY_COLORS[key].bar} />
                <span className="text-[11px] text-neutral-500 w-4 text-right">{count}</span>
              </div>
            ))}
            {unknownFns.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] w-12 text-neutral-600">None</span>
                <MiniBar value={unknownFns.length} max={functions.length} color="bg-neutral-700" />
                <span className="text-[11px] text-neutral-600 w-4 text-right">{unknownFns.length}</span>
              </div>
            )}
          </div>
        )}

        {/* Doc coverage */}
        {functions.length > 0 && (
          <div className="border-t border-neutral-800/60 pt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-neutral-600 font-bold tracking-wider">
                Doc coverage
              </span>
              <span className={`text-sm font-bold
                ${coverage >= 80 ? 'text-emerald-400' : coverage >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {coverage}%
              </span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500
                  ${coverage >= 80 ? 'bg-emerald-500' : coverage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${coverage}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-600">
              {withDesc} of {functions.length} functions documented
            </p>
          </div>
        )}

        {/* Most connected */}
        {busiestNode && (
          <div className="border-t border-neutral-800/60 pt-3">
            <div className="text-[10px] uppercase text-neutral-600 font-bold tracking-wider mb-1.5">
              Most connected
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300 truncate max-w-[150px]">
                {busiestNode.data?.label ?? busiestNode.id}
              </span>
              <span className="text-xs font-bold text-neutral-400 flex-shrink-0 ml-2">
                {busiest[1]} edges
              </span>
            </div>
          </div>
        )}

        {/* Warnings */}
        {highFns.length > 0 && (
          <div className="border-t border-neutral-800/60 pt-3">
            <div className="flex items-center gap-1.5 text-red-400 mb-1.5">
              <AlertTriangle size={12} />
              <span className="text-[10px] uppercase font-bold tracking-wider">
                High complexity ({highFns.length})
              </span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {highFns.map(fn => (
                <div key={fn.id} className="text-[11px] text-neutral-500 truncate pl-1 border-l border-red-900/60">
                  {fn.data?.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Panel position="top-left" className="m-4">
      {expanded ? panel : pill}
    </Panel>
  );
};