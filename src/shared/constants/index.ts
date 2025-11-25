export const API_ENDPOINTS = {
  BASE_URL:
    process.env.REACT_APP_API_BASE_URL ||
    'https:byq6k88df1.execute-api.ap-south-1.amazonaws.com/prod',
  STATIC_URL:
    process.env.REACT_APP_STATIC_BASE_URL ||
    'https:feature-toggle-bucket-abdur-1764071798.s3.ap-south-1.amazonaws.com/',
} as const;

export const AUTH = {
  TOKEN: process.env.REACT_APP_AUTH_TOKEN || '',
  SECRET: process.env.REACT_APP_AUTH_SECRET || 'togglePOC',
} as const;

export const FEATURE_TYPES = {
  BOOLEAN: 'boolean',
  STRING: 'string',
  NUMBER: 'number',
} as const;

export const UI_CONSTANTS = {
  MODAL_OVERLAY_Z_INDEX: 1000,
  MAX_ROLLOUT_PERCENTAGE: 100,
  MIN_ROLLOUT_PERCENTAGE: 0,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;

export const SUCCESS_MESSAGES = {
  GROUP_CREATED: 'Group created successfully',
  GROUP_DELETED: 'Group deleted successfully',
  FEATURE_CREATED: 'Feature created successfully',
  FEATURE_UPDATED: 'Feature updated successfully',
  FEATURE_DELETED: 'Feature deleted successfully',
  SEGMENT_ADDED: 'Segment added successfully',
  SEGMENT_DELETED: 'Segment deleted successfully',
  SEGMENTS_REORDERED: 'Segments reordered successfully',
} as const;
