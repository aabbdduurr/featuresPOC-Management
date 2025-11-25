import { useState, useCallback } from 'react';
import { useApp } from '../context/SimpleContext';
const useNotification = () => (message, type) => {
  if (type === 'error') {
    alert(`Error: ${message}`);
  }
};
import { getServiceContainer } from '../../shared/container';

export const useSegmentManagement = () => {
  const {
    state: {
      app: { selectedPlatform },
    },
  } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const showNotification = useNotification();

  const createSegment = useCallback(
    async (segmentName, segmentDescription, segmentValues) => {
      setLoading(true);
      setError(null);

      try {
        const { segmentService } = getServiceContainer();
        await segmentService.createSegment(segmentName, segmentDescription, segmentValues);
        showNotification('Segment created successfully', 'success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create segment';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showNotification]
  );

  const updateSegment = useCallback(
    async (segmentName, segmentDescription) => {
      setLoading(true);
      setError(null);

      try {
        const { segmentService } = getServiceContainer();
        await segmentService.updateSegment(segmentName, segmentDescription);
        showNotification('Segment updated successfully', 'success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update segment';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showNotification]
  );

  const addSegmentValues = useCallback(
    async (segmentName, segmentValues) => {
      setLoading(true);
      setError(null);

      try {
        const { segmentService } = getServiceContainer();
        await segmentService.addSegmentValues(segmentName, segmentValues);
        showNotification('Segment values added successfully', 'success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add segment values';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showNotification]
  );

  const addSegmentOverride = useCallback(
    async (feature, segmentCombination, featureValue, rollout) => {
      if (!selectedPlatform) {
        throw new Error('No platform selected');
      }

      setLoading(true);
      setError(null);

      try {
        const { featureService } = getServiceContainer();
        await featureService.changeFeatureValue(
          selectedPlatform,
          feature.id,
          featureValue,
          segmentCombination,
          rollout
        );

        showNotification('Segment override added successfully', 'success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add segment override';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedPlatform, showNotification]
  );

  const updateSegmentOverride = useCallback(
    async (feature, originalSegmentCombination, newSegmentCombination, featureValue, rollout) => {
      if (!selectedPlatform) {
        throw new Error('No platform selected');
      }

      setLoading(true);
      setError(null);

      try {
        const { featureService } = getServiceContainer();
        await featureService.deleteSegmentForFeature(
          selectedPlatform,
          feature.id,
          originalSegmentCombination
        );

        await featureService.changeFeatureValue(
          selectedPlatform,
          feature.id,
          featureValue,
          newSegmentCombination,
          rollout
        );

        showNotification('Segment override updated successfully', 'success');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update segment override';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedPlatform, showNotification]
  );

  const deleteSegmentOverride = useCallback(
    async (feature, segmentCombination) => {
      if (!selectedPlatform) {
        throw new Error('No platform selected');
      }

      setLoading(true);
      setError(null);

      try {
        const { featureService } = getServiceContainer();
        await featureService.deleteSegmentForFeature(
          selectedPlatform,
          feature.id,
          segmentCombination
        );

        showNotification('Segment override deleted successfully', 'success');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete segment override';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedPlatform, showNotification]
  );

  const reorderSegments = useCallback(
    async (feature, newOrder) => {
      if (!selectedPlatform) {
        throw new Error('No platform selected');
      }

      if (!Array.isArray(newOrder) || !newOrder.every(item => typeof item === 'number')) {
        throw new Error('New order must be an array of indices (numbers)');
      }

      setLoading(true);
      setError(null);

      try {
        const { featureService } = getServiceContainer();
        await featureService.reorderFeatureSegments(selectedPlatform, feature.id, newOrder);

        showNotification('Segments reordered successfully', 'success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to reorder segments';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedPlatform, showNotification]
  );

  return {
    createSegment,
    updateSegment,
    addSegmentValues,
    addSegmentOverride,
    updateSegmentOverride,
    deleteSegmentOverride,
    reorderSegments,
    loading,
    error,
  };
};
