/**
 * XSS Sanitization Utilities
 * 
 * Prevents script injection attacks by sanitizing user input.
 * Used on all labels, descriptions, tags, and other user-provided content.
 */

// Dangerous patterns to remove
const SCRIPT_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi, // onclick, onerror, etc.
  /on\w+\s*=\s*[^\s>]*/gi,
];

const DANGEROUS_TAGS = [
  'script', 'iframe', 'object', 'embed', 'link', 'style',
  'base', 'meta', 'applet', 'form'
];

/**
 * Sanitize a string by removing dangerous HTML/JS content
 * @param {string} input - Raw user input
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input, options = {}) {
  if (!input || typeof input !== 'string') return '';

  const {
    maxLength = 10000,
    allowNewlines = true,
    allowHTML = false,
  } = options;

  let cleaned = input.trim();

  // Truncate to max length
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  if (!allowHTML) {
    // Strip all HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, '');
  } else {
    // Remove only dangerous tags
    DANGEROUS_TAGS.forEach(tag => {
      const regex = new RegExp(`<${tag}\\b[^>]*>.*?</${tag}>`, 'gi');
      cleaned = cleaned.replace(regex, '');
      const selfClosing = new RegExp(`<${tag}\\b[^>]*/>`, 'gi');
      cleaned = cleaned.replace(selfClosing, '');
    });
  }

  // Remove dangerous patterns
  SCRIPT_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Handle newlines
  if (!allowNewlines) {
    cleaned = cleaned.replace(/[\r\n]+/g, ' ');
  }

  // Decode HTML entities to prevent encoded injection
  cleaned = decodeHTMLEntities(cleaned);

  // Remove null bytes and other control characters
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return cleaned.trim();
}

/**
 * Sanitize a label (node name, file name, etc.)
 * @param {string} label - Raw label input
 * @returns {string} - Sanitized label
 */
export function sanitizeLabel(label) {
  return sanitizeString(label, {
    maxLength: 200,
    allowNewlines: false,
    allowHTML: false,
  });
}

/**
 * Sanitize a description (longer text with newlines)
 * @param {string} description - Raw description input
 * @returns {string} - Sanitized description
 */
export function sanitizeDescription(description) {
  return sanitizeString(description, {
    maxLength: 50000,
    allowNewlines: true,
    allowHTML: false,
  });
}

/**
 * Sanitize an array of tags
 * @param {string[]} tags - Array of tag strings
 * @returns {string[]} - Sanitized tags
 */
export function sanitizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  
  return tags
    .map(tag => sanitizeString(tag, { maxLength: 50, allowNewlines: false, allowHTML: false }))
    .filter(tag => tag.length > 0)
    .slice(0, 50); // Max 50 tags
}

/**
 * Sanitize an entire node data object
 * @param {object} data - Node data object
 * @returns {object} - Sanitized data object
 */
export function sanitizeNodeData(data) {
  if (!data || typeof data !== 'object') return {};

  const sanitized = { ...data };

  // Sanitize label
  if (sanitized.label) {
    sanitized.label = sanitizeLabel(sanitized.label);
  }

  // Sanitize description
  if (sanitized.description) {
    sanitized.description = sanitizeDescription(sanitized.description);
  }

  // Sanitize tags
  if (sanitized.tags) {
    sanitized.tags = sanitizeTags(sanitized.tags);
  }

  // Sanitize techStack (array of strings)
  if (sanitized.techStack) {
    sanitized.techStack = sanitizeTags(sanitized.techStack);
  }

  // Sanitize params (array of strings)
  if (sanitized.params) {
    sanitized.params = sanitizeTags(sanitized.params);
  }

  // Sanitize exports (array of strings)
  if (sanitized.exports) {
    sanitized.exports = sanitizeTags(sanitized.exports);
  }

  // Sanitize returns (string)
  if (sanitized.returns) {
    sanitized.returns = sanitizeLabel(sanitized.returns);
  }

  // Sanitize fileType (enum, should be safe but check anyway)
  if (sanitized.fileType) {
    const allowedTypes = ['typescript', 'javascript', 'react', 'python', 'css', 'json', 'other'];
    if (!allowedTypes.includes(sanitized.fileType)) {
      sanitized.fileType = 'other';
    }
  }

  // Sanitize complexity (enum)
  if (sanitized.complexity) {
    const allowedComplexity = ['low', 'medium', 'high'];
    if (!allowedComplexity.includes(sanitized.complexity)) {
      sanitized.complexity = 'low';
    }
  }

  // Sanitize status (enum)
  if (sanitized.status) {
    const allowedStatus = ['planning', 'in-progress', 'stable', 'deprecated'];
    if (!allowedStatus.includes(sanitized.status)) {
      sanitized.status = 'planning';
    }
  }

  // Sanitize stage (enum)
  if (sanitized.stage) {
    const allowedStages = ['concept', 'development', 'production', 'maintenance', 'idea', 'prototyping', 'archived'];
    if (!allowedStages.includes(sanitized.stage)) {
      sanitized.stage = 'concept';
    }
  }

  return sanitized;
}

/**
 * Decode HTML entities to prevent encoded injection
 * @param {string} str - String with potential HTML entities
 * @returns {string} - Decoded string
 */
function decodeHTMLEntities(str) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

/**
 * Validate and sanitize import data (for JSON import feature)
 * @param {object} importData - Imported diagram data
 * @returns {object} - Sanitized import data
 */
export function sanitizeImportData(importData) {
  if (!importData || typeof importData !== 'object') {
    throw new Error('Invalid import data');
  }

  const sanitized = {
    version: importData.version || '1.0',
    exportedAt: importData.exportedAt || new Date().toISOString(),
    nodes: [],
    edges: [],
  };

  // Sanitize nodes
  if (Array.isArray(importData.nodes)) {
    sanitized.nodes = importData.nodes.map(node => ({
      ...node,
      data: sanitizeNodeData(node.data || {}),
    }));
  }

  // Sanitize edges (labels only)
  if (Array.isArray(importData.edges)) {
    sanitized.edges = importData.edges.map(edge => ({
      ...edge,
      data: edge.data ? {
        ...edge.data,
        label: edge.data.label ? sanitizeLabel(edge.data.label) : undefined,
      } : undefined,
    }));
  }

  return sanitized;
}