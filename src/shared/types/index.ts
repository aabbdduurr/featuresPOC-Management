export interface Platform {
  id: string;
  name: string;
  groups: Group[];
}

export interface Group {
  id: string;
  description: string;
  features: Feature[];
}

export interface Feature {
  id: string;
  description: string;
  type: FeatureType;
  value: FeatureValue;
  rollout?: Rollout;
  segments: Segment[];
  groupId?: string;
}

export interface Segment {
  combo: SegmentCombination;
  value: FeatureValue;
  rollout?: Rollout;
}

export interface Rollout {
  percentage: number;
  secondaryValue: FeatureValue;
}

export interface SegmentCombination {
  [segmentType: string]: string[];
}

export interface SegmentData {
  [segmentType: string]: {
    description: string;
    values: string[];
  };
}

export interface LogEntry {
  user: string;
  action: string;
  timestamp: string;
  segment?: SegmentCombination;
  value?: FeatureValue;
  rollout?: Rollout;
}

export type FeatureType = 'boolean' | 'string' | 'number';
export type FeatureValue = boolean | string | number;

export interface CreateGroupRequest {
  id: string;
  description: string;
}

export interface CreateFeatureRequest {
  id: string;
  description: string;
  type: FeatureType;
  value: FeatureValue;
  groupId: string;
}

export interface UpdateFeatureRequest {
  id: string;
  value: FeatureValue;
  rollout?: Rollout | null;
  segmentCombination?: SegmentCombination;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AppState {
  selectedPlatform: string | null;
  platformData: Platform | null;
  loading: boolean;
  error: string | null;
}

export interface ModalState {
  isGroupModalOpen: boolean;
  isFeatureModalOpen: boolean;
  isSegmentModalOpen: boolean;
  isLogModalOpen: boolean;
}
