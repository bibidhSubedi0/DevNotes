// Node type definitions
export const NODE_TYPES = {
  PROJECT:   'project',
  COMPONENT: 'component',
  FILE:      'file',
  FUNCTION:  'function',
};

// Edge/Connection types
export const EDGE_TYPES = {
  DEFAULT:    'default',
  IMPORTS:    'imports',
  EXTENDS:    'extends',
  DEPENDENCY: 'dependency',
};

// Edge configurations
export const EDGE_CONFIGS = {
  [EDGE_TYPES.DEFAULT]: {
    label:    'calls',
    color:    '#6366f1',
    animated: true,
  },
  [EDGE_TYPES.IMPORTS]: {
    label:    'imports',
    color:    '#8b5cf6',
    animated: false,
  },
  [EDGE_TYPES.EXTENDS]: {
    label:    'extends',
    color:    '#ec4899',
    animated: false,
  },
  [EDGE_TYPES.DEPENDENCY]: {
    label:    'depends on',
    color:    '#14b8a6',
    animated: true,
  },
};

// Node colors and styles
// Palette: violet (Project) → cyan (Component) → indigo/blue (File) → emerald (Function)
// All cool tones — cohesive dark dev-tool feel
export const NODE_COLORS = {
  [NODE_TYPES.PROJECT]: {
    primary: '#a855f7',               // purple-500
    border:  '#9333ea',               // purple-600
    bg:      'from-purple-600 via-purple-700 to-indigo-700',
  },
  [NODE_TYPES.COMPONENT]: {
    primary: '#06b6d4',               // cyan-500  ← was amber #f59e0b
    border:  '#0891b2',               // cyan-600
    bg:      'from-slate-800 via-slate-900 to-cyan-950',
  },
  [NODE_TYPES.FILE]: {
    primary: '#3b82f6',               // blue-500
    border:  '#2563eb',               // blue-600
    bg:      'from-blue-900 via-blue-950 to-indigo-950',
  },
  [NODE_TYPES.FUNCTION]: {
    primary: '#10b981',               // emerald-500
    border:  '#059669',               // emerald-600
    bg:      'from-neutral-900 to-neutral-900',
  },
};

// File type configurations
export const FILE_TYPES = {
  TYPESCRIPT: 'typescript',
  JAVASCRIPT: 'javascript',
  REACT:      'react',
  PYTHON:     'python',
};

export const FILE_TYPE_CONFIGS = {
  [FILE_TYPES.TYPESCRIPT]: {
    color:  'text-blue-300',
    bg:     'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  [FILE_TYPES.JAVASCRIPT]: {
    color:  'text-yellow-300',
    bg:     'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  [FILE_TYPES.REACT]: {
    color:  'text-cyan-300',
    bg:     'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  [FILE_TYPES.PYTHON]: {
    color:  'text-green-300',
    bg:     'bg-green-500/10',
    border: 'border-green-500/20',
  },
};

// Node sizing constants
export const NODE_SIZES = {
  PROJECT: {
    width:  200,
    height: 200,
  },
  COMPONENT: {
    width:        350,
    minHeight:    250,
    headerHeight: 80,
  },
  FILE: {
    width:          310,
    minHeight:      200,
    headerHeight:   52,
    functionHeight: 45,
    padding:        30,
  },
  FUNCTION: {
    minWidth: 160,
  },
};

// React Flow configuration
export const REACT_FLOW_CONFIG = {
  connectionRadius:  40,
  snapToGrid:        false,
  snapGrid:          [15, 15],
  defaultEdgeType:   'smoothstep',
  colorMode:         'dark',
};

// Background configuration
export const BACKGROUND_CONFIG = {
  color:   '#3a3a4a',
  variant: 'dots',
  gap:     24,
  size:    1.5,
  opacity: 0.5,
};

// MiniMap configuration
export const MINIMAP_CONFIG = {
  maskColor: 'rgba(0, 0, 0, 0.85)',
};