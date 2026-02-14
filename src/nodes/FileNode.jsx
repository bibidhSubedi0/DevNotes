import { Handle, Position, useReactFlow } from '@xyflow/react';
import { 
  FileCode, Plus, Code2, FileJson, FileType, FileText, Check, X, ChevronDown,
  Database, Palette, Settings, Package, Hash, Code, Globe, FileImage, FileCog,
  Braces, Terminal, FileSpreadsheet, Circle, AlertCircle
} from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { validateNodeLabel, validateCustomFileType } from '../utils/validation';

const fileIcons = {
  // Frontend
  typescript: { icon: FileType, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'TypeScript', ext: '.ts' },
  javascript: { icon: FileJson, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'JavaScript', ext: '.js' },
  react: { icon: Code2, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'React', ext: '.jsx' },
  tsx: { icon: Code2, color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'React TS', ext: '.tsx' },
  vue: { icon: Code2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Vue', ext: '.vue' },
  svelte: { icon: Code2, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Svelte', ext: '.svelte' },
  html: { icon: Globe, color: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'HTML', ext: '.html' },
  css: { icon: Palette, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', label: 'CSS', ext: '.css' },
  scss: { icon: Palette, color: 'text-pink-300', bg: 'bg-pink-500/10', border: 'border-pink-500/20', label: 'SCSS', ext: '.scss' },
  
  // Backend
  python: { icon: FileText, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Python', ext: '.py' },
  java: { icon: Code, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Java', ext: '.java' },
  c: { icon: Code, color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'C', ext: '.c' },
  cpp: { icon: Code, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'C++', ext: '.cpp' },
  csharp: { icon: Hash, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'C#', ext: '.cs' },
  go: { icon: Code, color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'Go', ext: '.go' },
  rust: { icon: Settings, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Rust', ext: '.rs' },
  php: { icon: Code, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', label: 'PHP', ext: '.php' },
  ruby: { icon: Code, color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Ruby', ext: '.rb' },
  
  // Data & Config
  json: { icon: Braces, color: 'text-yellow-300', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'JSON', ext: '.json' },
  yaml: { icon: FileText, color: 'text-purple-300', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'YAML', ext: '.yaml' },
  xml: { icon: Code, color: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'XML', ext: '.xml' },
  sql: { icon: Database, color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'SQL', ext: '.sql' },
  graphql: { icon: Database, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', label: 'GraphQL', ext: '.graphql' },
  
  // Shell & Scripts
  bash: { icon: Terminal, color: 'text-green-300', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Bash', ext: '.sh' },
  powershell: { icon: Terminal, color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'PowerShell', ext: '.ps1' },
  
  // Mobile
  swift: { icon: Code, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Swift', ext: '.swift' },
  kotlin: { icon: Code, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Kotlin', ext: '.kt' },
  dart: { icon: Code2, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'Dart', ext: '.dart' },
  
  // Documentation & Other
  markdown: { icon: FileText, color: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-500/20', label: 'Markdown', ext: '.md' },
  text: { icon: FileText, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', label: 'Text', ext: '.txt' },
  dockerfile: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Dockerfile', ext: '' },
  env: { icon: FileCog, color: 'text-yellow-300', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Environment', ext: '.env' },
  
  // Special - Other/Custom
  other: { icon: Circle, color: 'text-neutral-400', bg: 'bg-neutral-500/10', border: 'border-neutral-500/20', label: 'Other', ext: '' },
};

export default function FileNode({ id, data, selected }) {
  const { setNodes, getNodes } = useReactFlow();
  const fileConfig = fileIcons[data.fileType] || fileIcons.other;
  const Icon = fileConfig.icon;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [validationError, setValidationError] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isEditingCustomType, setIsEditingCustomType] = useState(false);
  const [customTypeValue, setCustomTypeValue] = useState('');
  const [customTypeError, setCustomTypeError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useCallback(node => {
    if (node && showTypeDropdown) {
      const rect = node.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
    }
  }, [showTypeDropdown]);

  // Calculate dynamic height based on number of child functions
  const nodes = getNodes();
  const childFunctions = nodes.filter(n => n.parentId === id);
  const minHeight = 200;
  const headerHeight = 52;
  const functionHeight = 45;
  const padding = 30;
  const calculatedHeight = Math.max(minHeight, headerHeight + (childFunctions.length * functionHeight) + padding);

  // Update parent component size when this file's size changes
  useEffect(() => {
    setNodes((nodes) => {
      const thisNode = nodes.find(n => n.id === id);
      if (thisNode?.parentId) {
        // Trigger parent recalculation by updating timestamp
        return nodes.map(n => n.id === thisNode.parentId ? { ...n, data: { ...n.data, lastUpdate: Date.now() } } : n);
      }
      return nodes;
    });
  }, [childFunctions.length, id, setNodes]);

  const addFunction = useCallback((evt) => {
    evt.stopPropagation();
    const newFnId = `fn_${Date.now()}`;
    
    setNodes((nodes) => {
      const childFunctions = nodes.filter(n => n.parentId === id);
      return [
        ...nodes,
        {
          id: newFnId,
          type: 'function',
          parentId: id,
          extent: 'parent',
          position: { x: 20, y: 65 + (childFunctions.length * 45) },
          data: { label: 'newFunction()', description: 'Add your logic here...' }
        }
      ];
    });
  }, [id, setNodes]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(data.label);
  };

  const handleSave = () => {
    const validation = validateNodeLabel(editValue);
    
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: validation.value } } : node
      )
    );
    setIsEditing(false);
    setValidationError('');
  };

  const handleCancel = () => {
    setEditValue(data.label);
    setIsEditing(false);
    setValidationError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleChange = (e) => {
    setEditValue(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  const handleCustomTypeSave = () => {
    const validation = validateCustomFileType(customTypeValue);
    
    if (!validation.valid) {
      setCustomTypeError(validation.error);
      return;
    }

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { 
          ...node, 
          data: { 
            ...node.data, 
            fileType: 'other',
            customFileType: validation.value
          } 
        } : node
      )
    );
    setIsEditingCustomType(false);
    setShowTypeDropdown(false);
    setCustomTypeValue('');
    setCustomTypeError('');
    setSearchQuery('');
  };

  const handleCustomTypeCancel = () => {
    setIsEditingCustomType(false);
    setCustomTypeValue('');
    setCustomTypeError('');
  };

  const handleTypeChange = (newType) => {
    if (newType === 'other') {
      setIsEditingCustomType(true);
      setCustomTypeValue(data.customFileType || '');
      return;
    }
    
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, fileType: newType, customFileType: null } } : node
      )
    );
    setShowTypeDropdown(false);
    setSearchQuery('');
  };

  // Filter file types based on search
  const filteredFileTypes = Object.entries(fileIcons).filter(([key, config]) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      config.label.toLowerCase().includes(search) ||
      key.toLowerCase().includes(search) ||
      (config.ext && config.ext.toLowerCase().includes(search))
    );
  });

  // Get display label for current file type
  const getDisplayLabel = () => {
    if (data.fileType === 'other' && data.customFileType) {
      return data.customFileType;
    }
    return fileConfig.label;
  };

  return (
    <div 
      className={`
        relative min-w-[280px]
        bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-950
        border-2 rounded-xl transition-all shadow-2xl group overflow-visible
        ${selected 
          ? 'border-blue-400 shadow-blue-500/40 ring-4 ring-blue-500/30' 
          : 'border-blue-600 hover:border-blue-500'
        }
      `}
      style={{ height: `${calculatedHeight}px` }}
    >
      
      {/* Decorative gradient overlay */}
      <div className={`absolute inset-0 ${fileConfig.bg} opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none rounded-xl`} />
      
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-3 bg-blue-950/60 border-b border-blue-700 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* File Type Icon with Dropdown */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowTypeDropdown(!showTypeDropdown);
                setSearchQuery('');
              }}
              className={`p-1.5 ${fileConfig.bg} rounded-lg flex-shrink-0 hover:bg-opacity-80 transition-all flex items-center gap-1 group/icon`}
              title="Change file type"
            >
              <Icon size={16} className={fileConfig.color} />
              <ChevronDown size={10} className={`${fileConfig.color} opacity-0 group-hover/icon:opacity-100 transition-opacity`} />
            </button>
            
            {/* Type Dropdown - Rendered via Portal */}
            {showTypeDropdown && createPortal(
              <>
                <div 
                  className="fixed inset-0 z-[9999]" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowTypeDropdown(false);
                    setIsEditingCustomType(false);
                    setSearchQuery('');
                  }}
                />
                <div 
                  className="fixed bg-neutral-900/98 backdrop-blur-xl border border-neutral-600 rounded-lg shadow-2xl z-[10000] overflow-hidden w-[180px]"
                  style={{
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`
                  }}
                >
                  {/* Search Bar */}
                  <div className="p-2 border-b border-neutral-700">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-neutral-800 text-white text-[11px] px-2 py-1 rounded border border-neutral-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Custom Type Input */}
                  {isEditingCustomType ? (
                    <div className="p-2 bg-neutral-850 border-b border-neutral-700">
                      <div className="text-[9px] uppercase text-neutral-500 font-bold mb-1.5">Custom Type</div>
                      <input
                        type="text"
                        placeholder="e.g., Solidity"
                        value={customTypeValue}
                        onChange={(e) => {
                          setCustomTypeValue(e.target.value);
                          if (customTypeError) setCustomTypeError('');
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCustomTypeSave();
                          else if (e.key === 'Escape') handleCustomTypeCancel();
                        }}
                        autoFocus
                        maxLength={30}
                        className={`
                          w-full bg-neutral-800 text-white text-[11px] px-2 py-1 rounded 
                          border focus:outline-none mb-1.5
                          ${customTypeError ? 'border-red-500 ring-2 ring-red-500/50' : 'border-blue-500'}
                        `}
                      />
                      {customTypeError && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-white bg-red-500 px-2 py-1 rounded shadow-lg mb-1.5">
                          <AlertCircle size={10} className="flex-shrink-0" />
                          <span>{customTypeError}</span>
                        </div>
                      )}
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCustomTypeSave(); }}
                          className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-[10px] rounded font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCustomTypeCancel(); }}
                          className="flex-1 px-2 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-[10px] rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* File Type List */}
                  <div className="max-h-[240px] overflow-y-auto overflow-x-hidden">
                    {filteredFileTypes.length === 0 ? (
                      <div className="px-3 py-3 text-center text-[10px] text-neutral-500">
                        No matches
                      </div>
                    ) : (
                      filteredFileTypes.map(([type, config]) => {
                        const TypeIcon = config.icon;
                        const isSelected = data.fileType === type && (type !== 'other' || !data.customFileType);
                        
                        return (
                          <button
                            key={type}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTypeChange(type);
                            }}
                            className={`
                              w-full px-2.5 py-1.5 flex items-center gap-2 hover:bg-neutral-800 transition-colors text-left
                              ${isSelected ? 'bg-neutral-800' : ''}
                            `}
                          >
                            <TypeIcon size={12} className={config.color} />
                            <span className="text-[11px] text-white font-medium truncate">{config.label}</span>
                            {isSelected && <Check size={10} className="ml-auto text-green-400 flex-shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Current Custom Type Display */}
                  {data.fileType === 'other' && data.customFileType && !isEditingCustomType && (
                    <div className="p-2 border-t border-neutral-700 bg-neutral-850/50">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Circle size={10} className="text-neutral-400 flex-shrink-0" />
                          <span className="text-[11px] text-white font-medium truncate">{data.customFileType}</span>
                          <Check size={10} className="text-green-400 flex-shrink-0" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingCustomType(true);
                            setCustomTypeValue(data.customFileType);
                          }}
                          className="text-[9px] text-blue-400 hover:text-blue-300 whitespace-nowrap"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>,
              document.body
            )}
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    maxLength={50}
                    className={`
                      bg-blue-800 text-white text-sm font-bold px-2 py-1 rounded 
                      border-2 focus:outline-none w-full
                      ${validationError ? 'border-red-400 ring-2 ring-red-500/50' : 'border-blue-400'}
                    `}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button onClick={handleSave} className="p-1 hover:bg-green-500/20 rounded text-green-400" title="Save">
                    <Check size={14} />
                  </button>
                  <button onClick={handleCancel} className="p-1 hover:bg-red-500/20 rounded text-red-400" title="Cancel">
                    <X size={14} />
                  </button>
                </div>
                {validationError && (
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-white bg-red-500 px-2 py-1 rounded shadow-lg">
                    <AlertCircle size={10} className="flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
                <span className="text-sm font-bold text-white tracking-tight">{data.label}</span>
                <div className="text-[10px] uppercase text-blue-300 font-semibold tracking-wider">
                  {getDisplayLabel()} • double-click to rename
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Add Button */}
        {!isEditing && (
          <button 
            onClick={addFunction}
            className="px-3 py-2 hover:bg-blue-500/20 rounded-lg text-blue-300 hover:text-blue-200 transition-all active:scale-90 border border-transparent hover:border-blue-600/50 flex-shrink-0 flex items-center gap-1.5"
            title="Add Function"
          >
            <Plus size={16} />
            <span className="text-xs font-semibold">Add Func</span>
          </button>
        )}
      </div>

      {/* Empty state hint */}
      {childFunctions.length === 0 && (
        <div className="absolute inset-x-0 bottom-0 top-[52px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="text-center px-4">
            <Plus size={20} className="mx-auto mb-1 text-blue-600" />
            <p className="text-[11px] text-blue-600 font-medium">Click + to add functions</p>
          </div>
        </div>
      )}

      {/* Connection Points - Bidirectional */}
      <Handle type="source" position={Position.Top} id="top" className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-blue-400 to-transparent !rounded-full !-top-1 !border-none !shadow-sm !shadow-blue-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Top} id="top-target" className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-blue-400 to-transparent !rounded-full !-top-1 !border-none !shadow-sm !shadow-blue-500/20" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-blue-400 to-transparent !rounded-full !-bottom-1 !border-none !shadow-sm !shadow-blue-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-blue-400 to-transparent !rounded-full !-bottom-1 !border-none !shadow-sm !shadow-blue-500/20" isConnectable={true} />
      <Handle type="source" position={Position.Left} id="left" className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-indigo-400 to-transparent !rounded-full !-left-1 !border-none !shadow-sm !shadow-indigo-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-indigo-400 to-transparent !rounded-full !-left-1 !border-none !shadow-sm !shadow-indigo-500/20" isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-indigo-400 to-transparent !rounded-full !-right-1 !border-none !shadow-sm !shadow-indigo-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Right} id="right-target" className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-indigo-400 to-transparent !rounded-full !-right-1 !border-none !shadow-sm !shadow-indigo-500/20" isConnectable={true} />
    </div>
  );
}