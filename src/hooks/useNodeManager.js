// useNodeManager.js
import { useCallback } from 'react';
import { 
  createProjectNode, 
  createComponentNode, 
  createFileNode, 
  createFunctionNode,
  calculateFilePosition,
  calculateFunctionPosition,
  getChildNodes,
} from '../utils/nodeHelpers';
import { 
  getSmartProjectPosition, 
  getSmartComponentPosition 
} from '../utils/positioning';

export const useNodeManager = (nodes, setNodes) => {
  // ✅ No more useReactFlow() – no provider needed at this level

  const addProject = useCallback(() => {
    const position = getSmartProjectPosition(nodes);
    const newNode = createProjectNode(position, nodes);
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  const addComponent = useCallback(() => {
    const position = getSmartComponentPosition(nodes);
    const newNode = createComponentNode(position, nodes);
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  // Use functional updater to get fresh nodes – avoids stale closure
  const addFile = useCallback((componentId) => {
    setNodes((nds) => {
      const childFiles = getChildNodes(componentId, nds).filter(n => n.type === 'file');
      const position = calculateFilePosition(childFiles);
      const newNode = createFileNode(componentId, position, nds);
      return [...nds, newNode];
    });
  }, [setNodes]);

  const addFunction = useCallback((fileId) => {
    setNodes((nds) => {
      const childFunctions = getChildNodes(fileId, nds);
      const position = calculateFunctionPosition(childFunctions);
      const newNode = createFunctionNode(fileId, position);
      return [...nds, newNode];
    });
  }, [setNodes]);

  const updateNode = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...updates } } 
          : node
      )
    );
  }, [setNodes]);

  const updateNodeStyle = useCallback((nodeId, styleUpdates) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId 
          ? { ...node, style: { ...node.style, ...styleUpdates } } 
          : node
      )
    );
  }, [setNodes]);

  return {
    addProject,
    addComponent,
    addFile,
    addFunction,
    updateNode,
    updateNodeStyle,
  };
};