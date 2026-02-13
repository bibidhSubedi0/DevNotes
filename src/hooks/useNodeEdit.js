import { useState, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

/**
 * Hook for handling node label editing
 * Shared across all node types
 */
export const useNodeEdit = (id, initialLabel) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialLabel);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setEditValue(initialLabel);
  }, [initialLabel]);

  const saveEdit = useCallback(() => {
    if (editValue.trim()) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id 
            ? { ...node, data: { ...node.data, label: editValue.trim() } } 
            : node
        )
      );
    }
    setIsEditing(false);
  }, [id, editValue, setNodes]);

  const cancelEdit = useCallback(() => {
    setEditValue(initialLabel);
    setIsEditing(false);
  }, [initialLabel]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }, [saveEdit, cancelEdit]);

  return {
    isEditing,
    editValue,
    setEditValue,
    startEdit,
    saveEdit,
    cancelEdit,
    handleKeyDown,
  };
};
