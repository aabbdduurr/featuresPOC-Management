import { useState, useCallback, useEffect } from 'react';
import { getServiceContainer } from '../../shared/container';
import { useApp } from '../context/SimpleContext';
import {
  Platform,
  Group,
  Feature,
  SegmentData,
  LogEntry,
  CreateGroupRequest,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  FeatureValue,
  Rollout,
  SegmentCombination,
} from '../../shared/types';
import { getErrorMessage } from '../../shared/utils';

export const usePlatforms = () => {
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlatforms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { platformService } = getServiceContainer();
      const platformList = await platformService.getPlatforms();
      setPlatforms(platformList);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      if (!errorMessage.includes('403') && !errorMessage.includes('404')) {
        setError(errorMessage);
      } else {
        setPlatforms([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlatforms();
  }, [loadPlatforms]);

  return {
    platforms,
    loading,
    error,
    refetch: loadPlatforms,
  };
};

export const usePlatformData = (platformId: string | null) => {
  const [platformData, setPlatformData] = useState<Platform | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlatformData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const { platformService } = getServiceContainer();
      const data = await platformService.getPlatformData(id);
      setPlatformData(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setPlatformData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (platformId) {
      loadPlatformData(platformId);
    } else {
      setPlatformData(null);
      setError(null);
    }
  }, [platformId, loadPlatformData]);

  const refetch = useCallback(() => {
    if (platformId) {
      loadPlatformData(platformId);
    }
  }, [platformId, loadPlatformData]);

  return {
    platformData,
    loading,
    error,
    refetch,
  };
};

export const useGroupManagement = (platformId: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = useCallback(
    async (groupData: CreateGroupRequest): Promise<boolean> => {
      if (!platformId) {
        setError('No platform selected');
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        const { groupService } = getServiceContainer();
        await groupService.createGroup(platformId, groupData);
        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [platformId]
  );

  const deleteGroup = useCallback(
    async (groupId: string): Promise<boolean> => {
      if (!platformId) {
        setError('No platform selected');
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        const { groupService } = getServiceContainer();
        await groupService.deleteGroup(platformId, groupId);
        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [platformId]
  );

  return {
    createGroup,
    deleteGroup,
    loading,
    error,
    clearError: () => setError(null),
  };
};

export const useFeatureManagement = (platformId: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFeature = useCallback(
    async (featureData: CreateFeatureRequest): Promise<boolean> => {
      if (!platformId) {
        setError('No platform selected');
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        const { featureService } = getServiceContainer();
        await featureService.createFeature(platformId, featureData);
        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [platformId]
  );

  const deleteFeature = useCallback(
    async (groupId: string, featureId: string): Promise<boolean> => {
      if (!platformId) {
        setError('No platform selected');
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        const { featureService } = getServiceContainer();
        await featureService.deleteFeature(platformId, groupId, featureId);
        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [platformId]
  );

  const updateFeatureValue = useCallback(
    async (
      featureId: string,
      value: FeatureValue,
      segmentCombination?: SegmentCombination | string[],
      rollout?: Rollout | null
    ): Promise<boolean> => {
      if (!platformId) {
        setError('No platform selected');
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        const { featureService } = getServiceContainer();
        await featureService.updateFeatureValue(
          platformId,
          featureId,
          value,
          segmentCombination,
          rollout
        );
        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [platformId]
  );

  const deleteSegment = useCallback(
    async (
      featureId: string,
      segmentCombination: SegmentCombination | string[]
    ): Promise<boolean> => {
      if (!platformId) {
        setError('No platform selected');
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        const { featureService } = getServiceContainer();
        let segmentArray: string[];
        if (Array.isArray(segmentCombination)) {
          segmentArray = segmentCombination;
        } else {
          segmentArray = Object.entries(segmentCombination).flatMap(([key, values]) =>
            Array.isArray(values) ? values.map(v => `${key}:${v}`) : [`${key}:${values}`]
          );
        }
        await featureService.deleteSegmentForFeature(platformId, featureId, segmentArray);
        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [platformId]
  );

  const reorderSegments = useCallback(
    async (featureId: string, newOrder: number[]): Promise<boolean> => {
      if (!platformId) {
        setError('No platform selected');
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        const { featureService } = getServiceContainer();
        await featureService.reorderFeatureSegments(platformId, featureId, newOrder);
        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [platformId]
  );

  return {
    createFeature,
    deleteFeature,
    updateFeatureValue,
    deleteSegment,
    reorderSegments,
    loading,
    error,
    clearError: () => setError(null),
  };
};

export const useSegmentData = () => {
  const [segmentData, setSegmentData] = useState<SegmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSegmentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { segmentService } = getServiceContainer();
      const data = await segmentService.getSegmentData();
      setSegmentData(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSegmentData();
  }, [loadSegmentData]);

  return {
    segmentData,
    loading,
    error,
    refetch: loadSegmentData,
  };
};

export const useSegmentManagement = () => {
  const { state } = useApp();
  const { updateFeatureValue } = useFeatureManagement(state.app.selectedPlatform);

  const createSegment = useCallback(
    async (
      featureId: string,
      segmentData: {
        combo: SegmentCombination;
        segmentCombination?: SegmentCombination;
        value: FeatureValue;
        rollout?: Rollout | null;
      }
    ): Promise<boolean> => {
      return await updateFeatureValue(
        featureId,
        segmentData.value,
        segmentData.segmentCombination || segmentData.combo,
        segmentData.rollout
      );
    },
    [updateFeatureValue]
  );

  const updateSegment = useCallback(
    async (
      featureId: string,
      segmentIndex: number,
      segmentData: {
        combo: SegmentCombination;
        segmentCombination?: SegmentCombination;
        value: FeatureValue;
        rollout?: Rollout | null;
      }
    ): Promise<boolean> => {
      return await updateFeatureValue(
        featureId,
        segmentData.value,
        segmentData.segmentCombination || segmentData.combo,
        segmentData.rollout
      );
    },
    [updateFeatureValue]
  );

  return {
    createSegment,
    updateSegment,
    loading: false,
    error: null,
  };
};

export const useLogs = (platformId: string | null, groupId: string | null, featureId?: string) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    if (!platformId || !groupId) {
      setLogs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { logService } = getServiceContainer();
      const logEntries = await logService.getLogs(platformId, groupId, featureId);
      setLogs(logEntries);
    } catch (err) {
      setError(getErrorMessage(err));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [platformId, groupId, featureId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return {
    logs,
    loading,
    error,
    refetch: loadLogs,
  };
};

export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T>(operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    execute,
    loading,
    error,
    clearError: () => setError(null),
  };
};
