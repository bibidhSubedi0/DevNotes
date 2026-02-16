import { Panel } from '@xyflow/react';
import { Undo2, Redo2 } from 'lucide-react';

export const UndoRedoControls = ({ canUndo, canRedo, onUndo, onRedo }) => {
  const btn = `
    flex items-center justify-center w-8 h-8 rounded-lg
    transition-all duration-100 active:scale-90
    disabled:opacity-25 disabled:cursor-not-allowed
  `;

  return (
    <Panel position="bottom-right" className="mb-20 mr-4">
      <div className="flex items-center gap-1
                      bg-neutral-900/95 backdrop-blur-xl
                      border border-neutral-700/60 rounded-xl
                      shadow-2xl shadow-black/40 p-1.5">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={btn + ' text-neutral-400 hover:text-white hover:bg-neutral-700/80'}
          title="Undo  (Ctrl + Z)"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={btn + ' text-neutral-400 hover:text-white hover:bg-neutral-700/80'}
          title="Redo  (Ctrl + Y)"
        >
          <Redo2 size={14} />
        </button>
      </div>
    </Panel>
  );
};