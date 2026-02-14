/**
 * Smart positioning utilities for nodes
 * Implements hierarchical auto-layout with collision detection
 */

const GRID_SIZE = 20;
const MIN_SPACING = 60;

/**
 * Snap position to grid for clean alignment
 */
export const snapToGrid = (position) => {
  return {
    x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
  };
};

/**
 * Check if two nodes overlap (including padding)
 */
const nodesOverlap = (pos1, size1, pos2, size2, padding = MIN_SPACING) => {
  return !(
    pos1.x + size1.width + padding < pos2.x ||
    pos2.x + size2.width + padding < pos1.x ||
    pos1.y + size1.height + padding < pos2.y ||
    pos2.y + size2.height + padding < pos1.y
  );
};

/**
 * Find next available position without overlaps
 */
const findFreePosition = (basePosition, nodeSize, existingNodes, maxAttempts = 50) => {
  const positions = [];
  
  // Generate spiral pattern positions
  for (let ring = 0; ring < maxAttempts; ring++) {
    const offset = ring * 80;
    positions.push(
      { x: basePosition.x + offset, y: basePosition.y },
      { x: basePosition.x - offset, y: basePosition.y },
      { x: basePosition.x, y: basePosition.y + offset },
      { x: basePosition.x, y: basePosition.y - offset },
      { x: basePosition.x + offset, y: basePosition.y + offset },
      { x: basePosition.x - offset, y: basePosition.y - offset },
      { x: basePosition.x + offset, y: basePosition.y - offset },
      { x: basePosition.x - offset, y: basePosition.y + offset }
    );
  }

  // Find first position that doesn't overlap
  for (const pos of positions) {
    let hasOverlap = false;
    
    for (const node of existingNodes) {
      const nodeSize2 = {
        width: node.style?.width || 200,
        height: node.style?.height || 200,
      };
      
      if (nodesOverlap(pos, nodeSize, node.position, nodeSize2)) {
        hasOverlap = true;
        break;
      }
    }
    
    if (!hasOverlap && pos.x >= 0 && pos.y >= 0) {
      return snapToGrid(pos);
    }
  }
  
  // Fallback to original position
  return snapToGrid(basePosition);
};

/**
 * Calculate optimal canvas center based on existing nodes
 */
const getCanvasCenter = (existingNodes) => {
  if (existingNodes.length === 0) {
    return { x: 400, y: 300 };
  }

  // Find bounding box of existing nodes
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  existingNodes.forEach(node => {
    const width = node.style?.width || 200;
    const height = node.style?.height || 200;
    
    minX = Math.min(minX, node.position.x);
    maxX = Math.max(maxX, node.position.x + width);
    minY = Math.min(minY, node.position.y);
    maxY = Math.max(maxY, node.position.y + height);
  });

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
};

/**
 * Get smart position for Project nodes
 * Projects are arranged in a grid pattern on the left side
 */
export const getSmartProjectPosition = (existingNodes) => {
  const projectNodes = existingNodes.filter(n => n.type === 'project');
  
  if (projectNodes.length === 0) {
    return snapToGrid({ x: 100, y: 100 });
  }

  // Arrange in vertical column with spacing
  const baseX = 100;
  const spacing = 280; // 200px node + 80px gap
  const row = Math.floor(projectNodes.length / 3);
  const col = projectNodes.length % 3;
  
  const basePosition = {
    x: baseX + (col * 300),
    y: 100 + (row * spacing),
  };

  return findFreePosition(
    basePosition,
    { width: 200, height: 200 },
    existingNodes
  );
};

/**
 * Get smart position for Component nodes
 * Components are positioned to the right of projects
 */
export const getSmartComponentPosition = (existingNodes) => {
  const componentNodes = existingNodes.filter(n => n.type === 'component');
  
  if (componentNodes.length === 0) {
    // First component goes to the right of projects
    return snapToGrid({ x: 500, y: 100 });
  }

  // Find rightmost component
  let rightmost = componentNodes.reduce((max, node) => 
    (node.position.x > max.position.x) ? node : max
  , componentNodes[0]);

  const basePosition = {
    x: rightmost.position.x + 450, // 350px width + 100px gap
    y: rightmost.position.y,
  };

  // If too far right, start new row
  if (basePosition.x > 1400) {
    const center = getCanvasCenter(existingNodes);
    const basePosition = {
      x: 500,
      y: center.y + 350,
    };
    
    return findFreePosition(
      basePosition,
      { width: 350, height: 250 },
      existingNodes
    );
  }

  return findFreePosition(
    basePosition,
    { width: 350, height: 250 },
    existingNodes
  );
};

/**
 * Legacy random position (deprecated but kept for compatibility)
 */
export const getRandomPosition = (minX = 100, maxX = 500, minY = 100, maxY = 400) => {
  return snapToGrid({
    x: Math.random() * (maxX - minX) + minX,
    y: Math.random() * (maxY - minY) + minY,
  });
};

/**
 * Aliases for backward compatibility
 */
export const getRandomProjectPosition = getSmartProjectPosition;
export const getRandomComponentPosition = getSmartComponentPosition;