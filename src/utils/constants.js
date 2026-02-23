// Node type definitions
export const NODE_TYPES = {
  PROJECT: 'project',
  COMPONENT: 'component',
  FILE: 'file',
  FUNCTION: 'function',
};

// Edge/Connection types
export const EDGE_TYPES = {
  CALLS:      'calls',
  IMPORTS:    'imports',
  EXTENDS:    'extends',
  IMPLEMENTS: 'implements',
  USES:       'uses',
  CONTAINS:   'contains',
  DEPENDS_ON: 'depends_on',
  EXPORTS_TO: 'exports_to',
};

// Edge configurations with distinct colors
export const EDGE_CONFIGS = {
  [EDGE_TYPES.CALLS]: { 
    label: 'calls', 
    color: '#6366f1',  // indigo
    animated: true 
  },
  [EDGE_TYPES.IMPORTS]: { 
    label: 'imports', 
    color: '#8b5cf6',  // purple
    animated: false 
  },
  [EDGE_TYPES.EXTENDS]: { 
    label: 'extends', 
    color: '#ec4899',  // pink
    animated: false 
  },
  [EDGE_TYPES.IMPLEMENTS]: { 
    label: 'implements', 
    color: '#f59e0b',  // amber
    animated: false 
  },
  [EDGE_TYPES.USES]: { 
    label: 'uses', 
    color: '#14b8a6',  // teal
    animated: false 
  },
  [EDGE_TYPES.CONTAINS]: { 
    label: 'contains', 
    color: '#22d3ee',  // cyan
    animated: false 
  },
  [EDGE_TYPES.DEPENDS_ON]: { 
    label: 'depends on', 
    color: '#f97316',  // orange
    animated: true 
  },
  [EDGE_TYPES.EXPORTS_TO]: { 
    label: 'exports to', 
    color: '#a855f7',  // violet
    animated: true 
  },
};

// Node colors and styles
export const NODE_COLORS = {
  [NODE_TYPES.PROJECT]: {
    primary: '#a855f7',
    border: '#9333ea',
    bg: 'from-purple-600 via-purple-700 to-indigo-700',
  },
  [NODE_TYPES.COMPONENT]: {
    primary: '#22d3ee',
    border: '#06b6d4',
    bg: 'from-cyan-800 via-cyan-900 to-teal-900',
  },
  [NODE_TYPES.FILE]: {
    primary: '#3b82f6',
    border: '#2563eb',
    bg: 'from-blue-900 via-blue-950 to-indigo-950',
  },
  [NODE_TYPES.FUNCTION]: {
    primary: '#34d399',
    border: '#10b981',
    bg: 'from-neutral-700 to-neutral-700/90',
  },
};

// File type configurations
export const FILE_TYPES = {
  TYPESCRIPT: 'typescript',
  JAVASCRIPT: 'javascript',
  REACT: 'react',
  PYTHON: 'python',
};

export const FILE_TYPE_CONFIGS = {
  [FILE_TYPES.TYPESCRIPT]: { 
    color: 'text-blue-300', 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/20' 
  },
  [FILE_TYPES.JAVASCRIPT]: { 
    color: 'text-yellow-300', 
    bg: 'bg-yellow-500/10', 
    border: 'border-yellow-500/20' 
  },
  [FILE_TYPES.REACT]: { 
    color: 'text-cyan-300', 
    bg: 'bg-cyan-500/10', 
    border: 'border-cyan-500/20' 
  },
  [FILE_TYPES.PYTHON]: { 
    color: 'text-green-300', 
    bg: 'bg-green-500/10', 
    border: 'border-green-500/20' 
  },
};


// Node sizing constants
export const NODE_SIZES = {
  PROJECT: {
    width: 200,
    height: 200,
  },
  COMPONENT: {
    width: 360,
    minHeight: 120,
  },
  FILE: {
    width: 312,  // Updated for new function width
    minHeight: 80,
    headerHeight: 40,
    functionHeight: 36,  // Updated slot height
    padding: 16,
  },
  FUNCTION: {
    width: 280,  // New increased width
    height: 36,  // New increased height
  },
};
// ReactFlow configuration
export const REACT_FLOW_CONFIG = {
  colorMode: 'dark',
  defaultEdgeType: 'smart',
  snapToGrid: false,
  snapGrid: [10, 10],
  connectionRadius: 30,
};

// Background configuration
export const BACKGROUND_CONFIG = {
  color: '#1a1a1a',
  variant: 'dots',
  gap: 16,
  size: 1,
};

// MiniMap configuration
export const MINIMAP_CONFIG = {
  maskColor: 'rgb(0, 0, 0, 0.8)',
};