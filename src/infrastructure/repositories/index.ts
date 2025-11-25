import {
  IPlatformRepository,
  IGroupRepository,
  IFeatureRepository,
  ISegmentRepository,
  ILogRepository,
} from '../../domain/repositories';
import {
  Platform,
  Group,
  Feature,
  SegmentData,
  LogEntry,
  SegmentCombination,
  CreateGroupRequest,
  CreateFeatureRequest,
  Rollout,
} from '../../shared/types';
import { HttpClient, StaticFileClient } from '../api/httpClient';

export class PlatformRepository implements IPlatformRepository {
  constructor(private staticFileClient: StaticFileClient) {}

  async getPlatforms(): Promise<string[]> {
    try {
      return await this.staticFileClient.getJson<string[]>('/platforms.json');
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('403') || error.message.includes('404'))
      ) {
        return [];
      }
      throw new Error(
        `Failed to fetch platforms: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getPlatformData(platform: string): Promise<Platform> {
    try {
      return await this.staticFileClient.getJson<Platform>(`/platforms/${platform}.json`);
    } catch (error) {
      throw new Error(
        `Failed to fetch platform data for ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export class GroupRepository implements IGroupRepository {
  constructor(private httpClient: HttpClient) {}

  async createGroup(platform: string, group: CreateGroupRequest): Promise<void> {
    const response = await this.httpClient.post('', {
      action: 'create-group',
      platform,
      featureGroup: group,
    });

    if (!response.success) {
      throw new Error(`Failed to create group: ${response.error}`);
    }
  }

  async deleteGroup(platform: string, groupId: string): Promise<void> {
    const response = await this.httpClient.post('', {
      action: 'delete-group',
      platform,
      featureGroup: { id: groupId },
    });

    if (!response.success) {
      throw new Error(`Failed to delete group: ${response.error}`);
    }
  }
}

export class FeatureRepository implements IFeatureRepository {
  constructor(private httpClient: HttpClient) {}

  async createFeature(platform: string, feature: CreateFeatureRequest): Promise<void> {
    const response = await this.httpClient.post('', {
      action: 'create-feature',
      platform,
      feature,
    });

    if (!response.success) {
      throw new Error(`Failed to create feature: ${response.error}`);
    }
  }

  async deleteFeature(platform: string, groupId: string, featureId: string): Promise<void> {
    const response = await this.httpClient.post('', {
      action: 'delete-feature',
      platform,
      feature: { id: featureId },
    });

    if (!response.success) {
      throw new Error(`Failed to delete feature: ${response.error}`);
    }
  }

  async updateFeatureValue(
    platform: string,
    featureId: string,
    value: any,
    segmentCombination: SegmentCombination | string[] = {},
    rollout: Rollout | null = null
  ): Promise<void> {
    if (
      !segmentCombination ||
      (Array.isArray(segmentCombination) && segmentCombination.length === 0) ||
      (typeof segmentCombination === 'object' && Object.keys(segmentCombination).length === 0)
    ) {
    }

    let segmentObj: any;
    if (Array.isArray(segmentCombination)) {
      segmentObj = {};
      segmentCombination.forEach(segmentString => {
        const [key, value] = segmentString.split(':');
        if (key && value) {
          if (!segmentObj[key]) {
            segmentObj[key] = [];
          }
          segmentObj[key].push(value);
        }
      });
    } else {
      segmentObj = segmentCombination;
    }

    const payload: any = {
      action: 'change-feature-value',
      platform,
      feature: { id: featureId },
      featureValue: value,
      segmentCombination: segmentObj,
    };

    if (rollout) {
      payload.rollout = rollout;
    }

    const response = await this.httpClient.post('', payload);

    if (!response.success) {
      console.error('API Error Details:', response);
      console.error('Payload sent:', payload);
      throw new Error(`Failed to update feature value: ${response.error || 'Unknown error'}`);
    }
  }

  async deleteSegmentForFeature(
    platform: string,
    featureId: string,
    segmentCombination: SegmentCombination | string[]
  ): Promise<void> {
    let segmentObj: any;
    if (Array.isArray(segmentCombination)) {
      segmentObj = {};
      segmentCombination.forEach(segmentString => {
        const [key, value] = segmentString.split(':');
        if (key && value) {
          if (!segmentObj[key]) {
            segmentObj[key] = [];
          }
          segmentObj[key].push(value);
        }
      });
    } else {
      segmentObj = segmentCombination;
    }

    const response = await this.httpClient.post('', {
      action: 'delete-segment-for-feature',
      platform,
      feature: { id: featureId },
      segmentCombination: segmentObj,
    });

    if (!response.success) {
      throw new Error(`Failed to delete segment: ${response.error}`);
    }
  }

  async reorderFeatureSegments(
    platform: string,
    featureId: string,
    newOrder: number[]
  ): Promise<void> {
    const response = await this.httpClient.post('', {
      action: 'reorder-feature-segments',
      platform,
      feature: { id: featureId },
      newSegmentOrder: newOrder,
    });

    if (!response.success) {
      throw new Error(`Failed to reorder segments: ${response.error}`);
    }
  }
}

export class SegmentRepository implements ISegmentRepository {
  constructor(
    private staticFileClient: StaticFileClient,
    private httpClient: HttpClient
  ) {}

  async getSegmentData(): Promise<SegmentData> {
    try {
      return await this.staticFileClient.getJson<SegmentData>('/segments.json');
    } catch (error) {
      throw new Error(
        `Failed to fetch segment data from S3: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async createSegment(
    segmentName: string,
    segmentDescription: string,
    segmentValues: string[]
  ): Promise<void> {
    const response = await this.httpClient.post('', {
      action: 'create-segment',
      segmentName,
      segmentDescription,
      segmentValues,
    });

    if (!response.success) {
      throw new Error(`Failed to create segment: ${response.error}`);
    }
  }

  async updateSegment(segmentName: string, segmentDescription: string): Promise<void> {
    const response = await this.httpClient.post('', {
      action: 'update-segment',
      segmentName,
      segmentDescription,
    });

    if (!response.success) {
      throw new Error(`Failed to update segment: ${response.error}`);
    }
  }

  async addSegmentValues(segmentName: string, segmentValues: string[]): Promise<void> {
    const response = await this.httpClient.post('', {
      action: 'add-segment-values',
      segmentName,
      segmentValues,
    });

    if (!response.success) {
      throw new Error(`Failed to add segment values: ${response.error}`);
    }
  }
}

export class LogRepository implements ILogRepository {
  constructor(private staticFileClient: StaticFileClient) {}

  async getLogs(platform: string, groupId: string, featureId?: string): Promise<LogEntry[]> {
    try {
      const logPath = featureId
        ? `/logs/${platform}/${groupId}/${featureId}.json`
        : `/logs/${platform}/${groupId}.json`;

      return await this.staticFileClient.getJson<LogEntry[]>(logPath);
    } catch (error) {
      throw new Error(
        `Failed to fetch logs: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
