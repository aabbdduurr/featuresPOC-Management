import {
  Platform,
  Group,
  Feature,
  SegmentData,
  LogEntry,
  SegmentCombination,
  CreateGroupRequest,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  Rollout,
} from '../../shared/types';

export interface IPlatformRepository {
  getPlatforms(): Promise<string[]>;
  getPlatformData(platform: string): Promise<Platform>;
}

export interface IGroupRepository {
  createGroup(platform: string, group: CreateGroupRequest): Promise<void>;
  deleteGroup(platform: string, groupId: string): Promise<void>;
}

export interface IFeatureRepository {
  createFeature(platform: string, feature: CreateFeatureRequest): Promise<void>;
  deleteFeature(platform: string, groupId: string, featureId: string): Promise<void>;
  updateFeatureValue(
    platform: string,
    featureId: string,
    value: any,
    segmentCombination?: SegmentCombination | string[],
    rollout?: Rollout | null
  ): Promise<void>;
  deleteSegmentForFeature(
    platform: string,
    featureId: string,
    segmentCombination: SegmentCombination | string[]
  ): Promise<void>;
  reorderFeatureSegments(platform: string, featureId: string, newOrder: number[]): Promise<void>;
}

export interface ISegmentRepository {
  getSegmentData(): Promise<SegmentData>;
  createSegment(
    segmentName: string,
    segmentDescription: string,
    segmentValues: string[]
  ): Promise<void>;
  updateSegment(segmentName: string, segmentDescription: string): Promise<void>;
  addSegmentValues(segmentName: string, segmentValues: string[]): Promise<void>;
}

export interface ILogRepository {
  getLogs(platform: string, groupId: string, featureId?: string): Promise<LogEntry[]>;
}
