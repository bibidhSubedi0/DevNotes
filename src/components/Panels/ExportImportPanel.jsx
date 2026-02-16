import { useState, useEffect } from 'react';
import { Download, Upload, Check, AlertCircle } from 'lucide-react';
import { useExportImport } from '../../hooks/useExportImport';

const TOAST_DURATION = 3000;

export const ExportImportPanel = ({ nodes, edges, setNodes, setEdges }) => {
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const { exportDiagram, triggerImport, handleFileChange, fileInputRef } =
    useExportImport(nodes, edges, setNodes, setEdges);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(t);
  }, [toast]);

  const onSuccess = (data) => {
    const nodeCount = data.nodes.filter(n => n.type === 'component' || n.type === 'project').length;
    setToast({ type: 'success', msg: `Loaded ${data.nodes.length} nodes` });
  };

  const onError = (msg) => {
    setToast({ type: 'error', msg });
  };

  const btnClass = `
    flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
    transition-all duration-100 active:scale-95
  `;

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2">

      {/* Toast */}
      {toast && (
        <div className={`
          flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
          shadow-lg backdrop-blur-xl border
          animate-in fade-in slide-in-from-top-2 duration-150
          ${toast.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-700/60 text-emerald-300'
            : 'bg-red-950/95 border-red-700/60 text-red-300'}
        `}>
          {toast.type === 'success'
            ? <Check size={13} />
            : <AlertCircle size={13} />}
          {toast.msg}
        </div>
      )}

      {/* Pill */}
      <div className="flex items-center
                      bg-neutral-900/95 backdrop-blur-xl
                      border border-neutral-700/60 rounded-xl
                      shadow-2xl shadow-black/30 p-1">

        <button
          onClick={triggerImport}
          className={btnClass + ' text-neutral-400 hover:text-white hover:bg-neutral-800'}
          title="Import diagram from file"
        >
          <Upload size={13} />
          Import
        </button>

        <div className="w-px h-4 bg-neutral-700/60 mx-0.5" />

        <button
          onClick={() => exportDiagram('my-diagram')}
          className={btnClass + ' text-neutral-400 hover:text-white hover:bg-neutral-800'}
          title="Export diagram as JSON"
        >
          <Download size={13} />
          Export
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.devnotes.json"
        className="hidden"
        onChange={(e) => handleFileChange(e, onSuccess, onError)}
      />
    </div>
  );
};