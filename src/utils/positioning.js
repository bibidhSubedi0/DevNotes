/**
 * Generate random position for new nodes
 * (This is the current behavior - will be improved later)
 */
export const getRandomPosition = (minX = 100, maxX = 500, minY = 100, maxY = 400) => {
  return {
    x: Math.random() * (maxX - minX) + minX,
    y: Math.random() * (maxY - minY) + minY,
  };
};

/**
 * Get random position for Project nodes
 */
export const getRandomProjectPosition = () => {
  return getRandomPosition(100, 500, 100, 400);
};

/**
 * Get random position for Component nodes
 */
export const getRandomComponentPosition = () => {
  return getRandomPosition(300, 900, 100, 500);
};
