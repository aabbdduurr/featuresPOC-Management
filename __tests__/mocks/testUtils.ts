import {
  Platform,
  Group,
  Feature,
  SegmentData,
  LogEntry,
  SegmentCombination,
  Rollout,
} from '../../src/shared/types';

export const createMockPlatform = (overrides: Partial<Platform> = {}): Platform => ({
  id: 'test-platform',
  name: 'Test Platform',
  groups: [],
  ...overrides,
});

export const createMockGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 'test-group',
  description: 'Test Group',
  features: [],
  ...overrides,
});

export const createMockFeature = (overrides: Partial<Feature> = {}): Feature => ({
  id: 'test-feature',
  description: 'Test Feature',
  type: 'boolean',
  value: true,
  segments: [],
  ...overrides,
});

export const createMockSegmentData = (): SegmentData => ({
  country: {
    description: 'User Country',
    values: ['US', 'CA', 'UK'],
  },
  userType: {
    description: 'User Type',
    values: ['premium', 'basic'],
  },
});

export const createMockLogEntry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  user: 'test@example.com',
  action: 'Test action',
  timestamp: '2024-01-01T10:00:00Z',
  ...overrides,
});

export const createMockRollout = (overrides: Partial<Rollout> = {}): Rollout => ({
  percentage: 50,
  secondaryValue: false,
  ...overrides,
});

export const createMockSegmentCombination = (): SegmentCombination => ({
  country: ['US'],
  userType: ['premium'],
});

export const createMockFetch = (response: any, options?: { status?: number; ok?: boolean }) => {
  const { status = 200, ok = true } = options || {};
  
  return {
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  };
};

export const createMockFetchError = (error: string) => {
  throw new Error(error);
};

export const TEST_API_BASE_URL = 'https:api.test.com';
export const TEST_STATIC_BASE_URL = 'https:static.test.com';
export const TEST_AUTH_TOKEN = 'test-token';

export const testPlatforms = ['web', 'mobile', 'api'];

export const testPlatformData: Platform = {
  id: 'web',
  name: 'Web Platform',
  groups: [
    {
      id: 'ui-features',
      description: 'UI Features',
      features: [
        {
          id: 'dark-mode',
          description: 'Dark mode toggle',
          type: 'boolean',
          value: false,
          segments: [],
        },
        {
          id: 'max-items',
          description: 'Maximum items per page',
          type: 'number',
          value: 20,
          segments: [],
        },
      ],
    },
  ],
};

export const testSegmentData: SegmentData = {
  country: {
    description: 'User Country',
    values: ['US', 'CA', 'UK', 'DE', 'FR'],
  },
  userType: {
    description: 'User Type',
    values: ['premium', 'basic', 'trial'],
  },
  deviceType: {
    description: 'Device Type',
    values: ['mobile', 'tablet', 'desktop'],
  },
};

export const testLogs: LogEntry[] = [
  {
    user: 'admin@example.com',
    action: 'Feature created',
    timestamp: '2024-01-01T10:00:00Z',
    value: true,
  },
  {
    user: 'user@example.com',
    action: 'Feature updated',
    timestamp: '2024-01-01T11:00:00Z',
    value: false,
  },
];