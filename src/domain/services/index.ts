import {
  IPlatformRepository,
  IGroupRepository,
  IFeatureRepository,
  ISegmentRepository,
  ILogRepository,
} from '../repositories';
import {
  Platform as PlatformEntity,
  Feature as FeatureEntity,
  Group as GroupEntity,
} from '../entities';
import {
  Platform,
  CreateGroupRequest,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  SegmentData,
  LogEntry,
  SegmentCombination,
  Rollout,
} from '../../shared/types';

export class PlatformService {
  constructor(private platformRepository: IPlatformRepository) {}

  async getPlatforms(): Promise<string[]> {
    return this.platformRepository.getPlatforms();
  }

  async getPlatformData(platform: string): Promise<Platform> {
    if (!platform || platform.trim() === '') {
      throw new Error('Platform name is required');
    }
    return this.platformRepository.getPlatformData(platform);
  }
}

export class GroupService {
  constructor(
    private groupRepository: IGroupRepository,
    private platformRepository: IPlatformRepository
  ) {}

  async createGroup(platform: string, groupData: CreateGroupRequest): Promise<void> {
    if (!platform || platform.trim() === '') {
      throw new Error('Platform name is required');
    }
    if (!groupData.id || groupData.id.trim() === '') {
      throw new Error('Group ID is required');
    }
    if (!groupData.description || groupData.description.trim() === '') {
      throw new Error('Group description is required');
    }

    try {
      const platformData = await this.platformRepository.getPlatformData(platform);
      const existingGroup = platformData.groups.find(g => g.id === groupData.id);
      if (existingGroup) {
        throw new Error(`Group with ID '${groupData.id}' already exists`);
      }
    } catch (error) {
      // If platform doesn't exist, it will be created
    }

    await this.groupRepository.createGroup(platform, groupData);
  }

  async deleteGroup(platform: string, groupId: string): Promise<void> {
    if (!platform || platform.trim() === '') {
      throw new Error('Platform name is required');
    }
    if (!groupId || groupId.trim() === '') {
      throw new Error('Group ID is required');
    }

    await this.groupRepository.deleteGroup(platform, groupId);
  }
}

export class FeatureService {
  constructor(
    private featureRepository: IFeatureRepository,
    private platformRepository: IPlatformRepository
  ) {}

  async createFeature(platform: string, featureData: CreateFeatureRequest): Promise<void> {
    this.validatePlatform(platform);
    this.validateFeatureData(featureData);

    try {
      const platformData = await this.platformRepository.getPlatformData(platform);
      const group = platformData.groups.find(g => g.id === featureData.groupId);
      if (!group) {
        throw new Error(`Group with ID '${featureData.groupId}' not found`);
      }

      const existingFeature = group.features.find(f => f.id === featureData.id);
      if (existingFeature) {
        throw new Error(`Feature with ID '${featureData.id}' already exists in group`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
    }

    await this.featureRepository.createFeature(platform, featureData);
  }

  async deleteFeature(platform: string, groupId: string, featureId: string): Promise<void> {
    this.validatePlatform(platform);
    if (!groupId || groupId.trim() === '') {
      throw new Error('Group ID is required');
    }
    if (!featureId || featureId.trim() === '') {
      throw new Error('Feature ID is required');
    }

    await this.featureRepository.deleteFeature(platform, groupId, featureId);
  }

  async updateFeatureValue(
    platform: string,
    featureId: string,
    value: any,
    segmentCombination?: SegmentCombination | string[],
    rollout?: Rollout | null
  ): Promise<void> {
    this.validatePlatform(platform);
    if (!featureId || featureId.trim() === '') {
      throw new Error('Feature ID is required');
    }

    if (rollout) {
      this.validateRollout(rollout);
    }

    await this.featureRepository.updateFeatureValue(
      platform,
      featureId,
      value,
      segmentCombination,
      rollout
    );
  }

  async deleteSegmentForFeature(
    platform: string,
    featureId: string,
    segmentCombination: SegmentCombination | string[]
  ): Promise<void> {
    this.validatePlatform(platform);
    if (!featureId || featureId.trim() === '') {
      throw new Error('Feature ID is required');
    }
    if (
      !segmentCombination ||
      (Array.isArray(segmentCombination) && segmentCombination.length === 0) ||
      (!Array.isArray(segmentCombination) && Object.keys(segmentCombination).length === 0)
    ) {
      throw new Error('Segment combination is required');
    }

    await this.featureRepository.deleteSegmentForFeature(platform, featureId, segmentCombination);
  }

  async reorderFeatureSegments(
    platform: string,
    featureId: string,
    newOrder: number[]
  ): Promise<void> {
    this.validatePlatform(platform);
    if (!featureId || featureId.trim() === '') {
      throw new Error('Feature ID is required');
    }
    if (!Array.isArray(newOrder) || newOrder.length === 0) {
      throw new Error('New order array is required');
    }

    if (!newOrder.every(item => typeof item === 'number' && Number.isInteger(item))) {
      throw new Error('New order must contain only integer indices');
    }

    await this.featureRepository.reorderFeatureSegments(platform, featureId, newOrder);
  }

  private validatePlatform(platform: string): void {
    if (!platform || platform.trim() === '') {
      throw new Error('Platform name is required');
    }
  }

  private validateFeatureData(featureData: CreateFeatureRequest): void {
    if (!featureData.id || featureData.id.trim() === '') {
      throw new Error('Feature ID is required');
    }
    if (!featureData.description || featureData.description.trim() === '') {
      throw new Error('Feature description is required');
    }
    if (!featureData.type || !['boolean', 'string', 'number'].includes(featureData.type)) {
      throw new Error('Valid feature type is required (boolean, string, or number)');
    }
    if (!featureData.groupId || featureData.groupId.trim() === '') {
      throw new Error('Group ID is required');
    }
    if (featureData.value === undefined || featureData.value === null) {
      throw new Error('Feature value is required');
    }

    const valueType = typeof featureData.value;
    if (featureData.type === 'boolean' && valueType !== 'boolean') {
      throw new Error('Feature value must be boolean for boolean type');
    }
    if (featureData.type === 'number' && valueType !== 'number') {
      throw new Error('Feature value must be number for number type');
    }
    if (featureData.type === 'string' && valueType !== 'string') {
      throw new Error('Feature value must be string for string type');
    }
  }

  private validateRollout(rollout: Rollout): void {
    if (
      typeof rollout.percentage !== 'number' ||
      rollout.percentage < 0 ||
      rollout.percentage > 100
    ) {
      throw new Error('Rollout percentage must be a number between 0 and 100');
    }
    if (rollout.secondaryValue === undefined || rollout.secondaryValue === null) {
      throw new Error('Rollout secondary value is required');
    }
  }
}

export class SegmentService {
  constructor(private segmentRepository: ISegmentRepository) {}

  async getSegmentData(): Promise<SegmentData> {
    return this.segmentRepository.getSegmentData();
  }

  async createSegment(
    segmentName: string,
    segmentDescription: string,
    segmentValues: string[]
  ): Promise<void> {
    if (!segmentName || segmentName.trim() === '') {
      throw new Error('Segment name is required');
    }
    if (!segmentDescription || segmentDescription.trim() === '') {
      throw new Error('Segment description is required');
    }
    if (!Array.isArray(segmentValues) || segmentValues.length === 0) {
      throw new Error('Segment values are required');
    }

    await this.segmentRepository.createSegment(segmentName, segmentDescription, segmentValues);
  }

  async updateSegment(segmentName: string, segmentDescription: string): Promise<void> {
    if (!segmentName || segmentName.trim() === '') {
      throw new Error('Segment name is required');
    }
    if (!segmentDescription || segmentDescription.trim() === '') {
      throw new Error('Segment description is required');
    }

    await this.segmentRepository.updateSegment(segmentName, segmentDescription);
  }

  async addSegmentValues(segmentName: string, segmentValues: string[]): Promise<void> {
    if (!segmentName || segmentName.trim() === '') {
      throw new Error('Segment name is required');
    }
    if (!Array.isArray(segmentValues) || segmentValues.length === 0) {
      throw new Error('Segment values are required');
    }

    await this.segmentRepository.addSegmentValues(segmentName, segmentValues);
  }
}

export class LogService {
  constructor(private logRepository: ILogRepository) {}

  async getLogs(platform: string, groupId: string, featureId?: string): Promise<LogEntry[]> {
    if (!platform || platform.trim() === '') {
      throw new Error('Platform name is required');
    }
    if (!groupId || groupId.trim() === '') {
      throw new Error('Group ID is required');
    }

    return this.logRepository.getLogs(platform, groupId, featureId);
  }
}
