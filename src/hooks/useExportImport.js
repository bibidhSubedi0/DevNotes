import { useCallback, useRef } from 'react';
import { sanitizeImportData } from '../utils/sanitize';

const FILE_VERSION = 1;

// Strip runtime-only fields before saving
const cleanNode = ({ selected, dragging, ...node }) => node;

export const useExportImport = (nodes, edges, setNodes, setEdges) => {

  // ── Export ────────────────────────────────────────────────────────────────
  const exportDiagram = useCallback((name = 'diagram') => {
    const payload = {
      version:    FILE_VERSION,
      exportedAt: new Date().toISOString(),
      nodes:      nodes.map(cleanNode),
      edges,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${name}.devnotes.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // ── Import ────────────────────────────────────────────────────────────────
  const fileInputRef = useRef(null);

  const triggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e, onSuccess, onError) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset so the same file can be re-imported
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target.result);

        // Basic validation
        if (!Array.isArray(raw.nodes) || !Array.isArray(raw.edges)) {
          onError('Invalid file — missing nodes or edges.');
          return;
        }
        if (raw.version !== FILE_VERSION) {
          // Still try to load, just warn
          console.warn(`File version ${raw.version}, expected ${FILE_VERSION}. Loading anyway.`);
        }

        // SANITIZE imported data to prevent XSS
        const sanitized = sanitizeImportData(raw);

        setNodes(sanitized.nodes);
        setEdges(sanitized.edges);
        onSuccess(sanitized);
      } catch (err) {
        console.error('Import error:', err);
        onError('Could not parse file — make sure it\'s a valid .devnotes.json file.');
      }
    };
    reader.readAsText(file);
  }, [setNodes, setEdges]);

  return { exportDiagram, triggerImport, handleFileChange, fileInputRef };
};