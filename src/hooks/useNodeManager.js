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

export const useNodeManager = (nodes, setNodes, screenToFlowPositionRef) => {

  /** Get canvas coords at viewport center, with fallback if not yet available */
  const getCenter = useCallback(() => {
    const screenToFlowPosition = screenToFlowPositionRef?.current;
    if (screenToFlowPosition) {
      return screenToFlowPosition({
        x: window.innerWidth  / 2,
        y: window.innerHeight / 2,
      });
    }
    return { x: 400, y: 300 };
  }, [screenToFlowPositionRef]);

  const addProject = useCallback(() => {
    const center = getCenter();
    const position = { x: center.x - 96, y: center.y - 96 };
    const newNode = createProjectNode(position, nodes);
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes, getCenter]);

  const addComponent = useCallback(() => {
    const center = getCenter();
    const position = { x: center.x - 180, y: center.y - 100 };
    const newNode = createComponentNode(position, nodes);
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes, getCenter]);

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