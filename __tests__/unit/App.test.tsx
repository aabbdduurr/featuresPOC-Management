import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

jest.mock('../../src/shared/container', () => ({
  getServiceContainer: () => ({
    platformService: {
      getPlatforms: jest.fn().mockResolvedValue(['web', 'mobile']),
      getPlatformData: jest.fn().mockResolvedValue({
        id: 'web',
        name: 'Web Platform',
        groups: [],
      }),
    },
    groupService: {
      createGroup: jest.fn().mockResolvedValue(undefined),
      deleteGroup: jest.fn().mockResolvedValue(undefined),
    },
    featureService: {
      createFeature: jest.fn().mockResolvedValue(undefined),
      deleteFeature: jest.fn().mockResolvedValue(undefined),
      updateFeatureValue: jest.fn().mockResolvedValue(undefined),
      deleteSegmentForFeature: jest.fn().mockResolvedValue(undefined),
      reorderFeatureSegments: jest.fn().mockResolvedValue(undefined),
    },
    segmentService: {
      getSegmentData: jest.fn().mockResolvedValue({}),
    },
    logService: {
      getLogs: jest.fn().mockResolvedValue([]),
    },
  }),
}));

describe('App', () => {
  test('renders feature management system title', () => {
    render(<App />);
    const titleElement = screen.getByText(/feature management system/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('shows welcome message when no platform is selected', () => {
    render(<App />);
    const welcomeMessage = screen.getByText(/please select a platform/i);
    expect(welcomeMessage).toBeInTheDocument();
  });
});