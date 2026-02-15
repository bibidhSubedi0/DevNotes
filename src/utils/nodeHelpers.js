import { NODE_TYPES, NODE_SIZES, FILE_TYPES } from './constants';

/**
 * Generate unique node ID
 */
export const generateNodeId = (type) => {
  return `${type}_${Date.now()}`;
};

/**
 * Create a new Project node
 */
export const createProjectNode = (position, existingNodes) => {
  const projectCount = existingNodes.filter(n => n.type === NODE_TYPES.PROJECT).length;
  
  return {
    id: generateNodeId(NODE_TYPES.PROJECT),
    type: NODE_TYPES.PROJECT,
    position,
    data: { label: `Project ${projectCount + 1}` },
  };
};

/**
 * Create a new Component node
 */
export const createComponentNode = (position, existingNodes) => {
  const componentCount = existingNodes.filter(n => n.type === NODE_TYPES.COMPONENT).length;
  
  return {
    id: generateNodeId(NODE_TYPES.COMPONENT),
    type: NODE_TYPES.COMPONENT,
    position,
    data: { label: `Component ${componentCount + 1}` },
    style: { 
      width: NODE_SIZES.COMPONENT.width, 
      height: NODE_SIZES.COMPONENT.minHeight 
    },
  };
};

/**
 * Create a new File node (nested in Component)
 */
export const createFileNode = (parentId, position, existingNodes) => {
  return {
    id: generateNodeId(NODE_TYPES.FILE),
    type: NODE_TYPES.FILE,
    parentId,
    extent: 'parent',
    position,
    data: { label: 'NewFile.ts', fileType: FILE_TYPES.TYPESCRIPT },
    style: { width: NODE_SIZES.FILE.width },
  };
};

/**
 * Create a new Function node (nested in File)
 */
export const createFunctionNode = (parentId, position) => {
  return {
    id: generateNodeId(NODE_TYPES.FUNCTION),
    type: NODE_TYPES.FUNCTION,
    parentId,
    extent: 'parent',
    position,
    data: { 
      label: 'newFunction()', 
      description: 'Add your logic here...' 
    },
  };
};

/**
 * Calculate position for new File inside Component
 */
export const calculateFilePosition = (childFiles) => {
  const baseY = 70;
  const spacing = 220;
  return { x: 20, y: baseY + (childFiles.length * spacing) };
};

/**
 * Calculate position for new Function inside File
 */
export const calculateFunctionPosition = (childFunctions) => {
  // Must match FN_START_Y and FN_SLOT in FileNode.jsx
  const baseY   = 90;
  const spacing = 114;
  return { x: 20, y: baseY + (childFunctions.length * spacing) };
};

/**
 * Calculate dynamic height for File node based on Functions
 */
export const calculateFileHeight = (functionCount) => {
  const { minHeight, headerHeight, functionHeight, padding } = NODE_SIZES.FILE;
  return Math.max(minHeight, headerHeight + (functionCount * functionHeight) + padding);
};

/**
 * Calculate dynamic height for Component node based on Files
 */
export const calculateComponentHeight = (childFiles, allNodes) => {
  const { minHeight, headerHeight } = NODE_SIZES.COMPONENT;
  
  let totalHeight = headerHeight; // Header + padding
  
  childFiles.forEach(file => {
    const fileFunctions = allNodes.filter(n => n.parentId === file.id);
    const fileHeight = calculateFileHeight(fileFunctions.length);
    totalHeight += fileHeight + 20; // File height + spacing
  });

  return Math.max(minHeight, totalHeight);
};

/**
 * Get children nodes of a parent
 */
export const getChildNodes = (parentId, nodes) => {
  return nodes.filter(n => n.parentId === parentId);
};

/**
 * Get all descendants of a node (recursive)
 */
export const getAllDescendants = (nodeId, nodes) => {
  const children = getChildNodes(nodeId, nodes);
  const descendants = [...children];
  
  children.forEach(child => {
    descendants.push(...getAllDescendants(child.id, nodes));
  });
  
  return descendants;
};