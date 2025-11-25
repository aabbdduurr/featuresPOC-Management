import React, { useState } from 'react';
import { Group, Feature } from '../../../shared/types';
import { ActionButton } from '../shared/ActionButton/ActionButton';
import { SegmentList } from '../SegmentList/SegmentList';
import { LogModal } from '../modals/LogModal/LogModal';
import { useApp } from '../../context/SimpleContext';
import { useGroupManagement, useFeatureManagement } from '../../hooks';
import './GroupsSection.css';

interface GroupsSectionProps {
  groups: Group[];
  onRefresh: () => void;
}

export const GroupsSection: React.FC<GroupsSectionProps> = ({ groups, onRefresh }) => {
  const { state, actions } = useApp();
  const { deleteGroup } = useGroupManagement(state.app.selectedPlatform);
  const { deleteFeature, deleteSegment, reorderSegments } = useFeatureManagement(
    state.app.selectedPlatform
  );
  const [localGroups, setLocalGroups] = useState<Group[]>(groups);

  React.useEffect(() => {
    setLocalGroups(groups);
  }, [groups]);

  const toggleGroup = (groupId: string) => {
    const currentExpanded = state.app.expandedGroups || [];
    const newExpanded = currentExpanded.includes(groupId)
      ? currentExpanded.filter(id => id !== groupId)
      : [...currentExpanded, groupId];
    actions.setExpandedGroups(newExpanded);
  };

  const handleAddFeature = (groupId: string) => {
    actions.saveScrollPosition(window.scrollY);
    actions.openFeatureModal(groupId);
  };

  const handleEditFeature = (feature: Feature) => {
    actions.saveScrollPosition(window.scrollY);
    actions.openEditModal(feature);
  };

  const handleAddSegment = (feature: Feature) => {
    actions.saveScrollPosition(window.scrollY);
    actions.openSegmentModal(feature);
  };

  const handleEditSegment = (feature: Feature, segmentIndex: number) => {
    actions.saveScrollPosition(window.scrollY);
    actions.openSegmentModal(feature, segmentIndex);
  };

  const handleViewLogs = (feature: Feature, group: Group) => {
    if (state.app.selectedPlatform) {
      actions.openLogModal(feature, state.app.selectedPlatform, group.id);
    }
  };

  const handleDeleteSegment = async (feature: Feature, segmentIndex: number) => {
    if (window.confirm('Are you sure you want to delete this segment override?')) {
      const segment = feature.segments?.[segmentIndex];
      if (segment) {
        const success = await deleteSegment(feature.id, segment.combo);
        if (success) {
          onRefresh();
        }
      }
    }
  };

  const handleMoveSegmentUp = async (feature: Feature, segmentIndex: number) => {
    if (!feature.segments || segmentIndex === 0) return;

    const updatedGroups = localGroups.map(group => ({
      ...group,
      features: group.features.map(f => {
        if (f.id === feature.id) {
          const newSegments = [...f.segments!];
          [newSegments[segmentIndex], newSegments[segmentIndex - 1]] = [
            newSegments[segmentIndex - 1],
            newSegments[segmentIndex],
          ];
          return { ...f, segments: newSegments };
        }
        return f;
      }),
    }));
    setLocalGroups(updatedGroups);

    const newOrder = [...Array(feature.segments.length).keys()];
    [newOrder[segmentIndex], newOrder[segmentIndex - 1]] = [
      newOrder[segmentIndex - 1],
      newOrder[segmentIndex],
    ];

    const success = await reorderSegments(feature.id, newOrder);
    if (!success) {
      setLocalGroups(groups);
    }
  };

  const handleMoveSegmentDown = async (feature: Feature, segmentIndex: number) => {
    if (!feature.segments || segmentIndex === feature.segments.length - 1) return;

    const updatedGroups = localGroups.map(group => ({
      ...group,
      features: group.features.map(f => {
        if (f.id === feature.id) {
          const newSegments = [...f.segments!];
          [newSegments[segmentIndex], newSegments[segmentIndex + 1]] = [
            newSegments[segmentIndex + 1],
            newSegments[segmentIndex],
          ];
          return { ...f, segments: newSegments };
        }
        return f;
      }),
    }));
    setLocalGroups(updatedGroups);

    const newOrder = [...Array(feature.segments.length).keys()];
    [newOrder[segmentIndex], newOrder[segmentIndex + 1]] = [
      newOrder[segmentIndex + 1],
      newOrder[segmentIndex],
    ];

    const success = await reorderSegments(feature.id, newOrder);
    if (!success) {
      setLocalGroups(groups);
    }
  };

  const handleDeleteFeature = async (groupId: string, featureId: string) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      const success = await deleteFeature(groupId, featureId);
      if (success) {
        onRefresh();
      }
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this group? This will also delete all features in it.'
      )
    ) {
      const success = await deleteGroup(groupId);
      if (success) {
        onRefresh();
      }
    }
  };

  if (groups.length === 0) {
    return (
      <section className="groups-section">
        <div className="groups-section__empty">
          <h2>No Groups Found</h2>
          <p>Create your first group to start managing features.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="groups-section">
      <div className="groups-section__content">
        <h2 className="groups-section__title">Feature Groups</h2>
        <div className="groups-section__list">
          {localGroups.map(group => (
            <div key={group.id} className="group-card">
              <div className="group-card__header">
                <div className="group-card__info">
                  <h3 className="group-card__title" onClick={() => toggleGroup(group.id)}>
                    {group.description}
                    <span className="group-card__icon">
                      {(state.app.expandedGroups || []).includes(group.id) ? '▼' : '▶'}
                    </span>
                  </h3>
                  <span className="group-card__feature-count">
                    {group.features.length} feature{group.features.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="group-card__actions">
                  <ActionButton
                    variant="primary"
                    size="small"
                    onClick={() => handleAddFeature(group.id)}
                  >
                    Add Feature
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    size="small"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    Delete Group
                  </ActionButton>
                </div>
              </div>

              {(state.app.expandedGroups || []).includes(group.id) && (
                <div className="group-card__features">
                  {group.features.length > 0 ? (
                    group.features.map(feature => (
                      <div key={feature.id} className="feature-item">
                        <div className="feature-item__info">
                          <div className="feature-item__header">
                            <span className="feature-item__name">{feature.description}</span>
                            <span
                              className={`feature-item__type feature-item__type--${feature.type}`}
                            >
                              {feature.type}
                            </span>
                          </div>
                          <div className="feature-item__value-container">
                            <div className="feature-item__primary-value">
                              <span className="feature-item__value-label">Primary:</span>
                              <span className="feature-item__value">
                                {feature.type === 'boolean'
                                  ? feature.value
                                    ? '✓ Enabled'
                                    : '✗ Disabled'
                                  : String(feature.value)}
                              </span>
                            </div>
                            {feature.rollout && (
                              <div className="feature-item__rollout">
                                <div className="feature-item__rollout-info">
                                  <span className="feature-item__rollout-percentage">
                                    {feature.rollout.percentage}%
                                  </span>
                                  <div className="feature-item__rollout-bar">
                                    <div
                                      className="feature-item__rollout-fill"
                                      style={{ width: `${feature.rollout.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="feature-item__secondary-value">
                                  <span className="feature-item__value-label">Secondary:</span>
                                  <span className="feature-item__value">
                                    {feature.type === 'boolean'
                                      ? feature.rollout.secondaryValue
                                        ? '✓ Enabled'
                                        : '✗ Disabled'
                                      : String(feature.rollout.secondaryValue)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="feature-item__actions">
                          <ActionButton
                            variant="secondary"
                            size="small"
                            onClick={() => handleAddSegment(feature)}
                          >
                            Add Segment
                          </ActionButton>
                          <ActionButton
                            variant="secondary"
                            size="small"
                            onClick={() => handleViewLogs(feature, group)}
                          >
                            View Logs
                          </ActionButton>
                          <ActionButton
                            variant="primary"
                            size="small"
                            onClick={() => handleEditFeature(feature)}
                          >
                            Edit
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            size="small"
                            onClick={() => handleDeleteFeature(group.id, feature.id)}
                          >
                            Delete
                          </ActionButton>
                        </div>

                        {feature.segments && feature.segments.length > 0 && (
                          <div className="feature-item__segments">
                            <SegmentList
                              segments={feature.segments}
                              onEditSegment={index => handleEditSegment(feature, index)}
                              onDeleteSegment={index => handleDeleteSegment(feature, index)}
                              onMoveSegmentUp={index => handleMoveSegmentUp(feature, index)}
                              onMoveSegmentDown={index => handleMoveSegmentDown(feature, index)}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="group-card__no-features">
                      <p>No features in this group yet.</p>
                      <ActionButton variant="primary" onClick={() => handleAddFeature(group.id)}>
                        Add First Feature
                      </ActionButton>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Log Modal */}
      {state.app.isLogModalOpen &&
        state.app.logFeature &&
        state.app.logPlatform &&
        state.app.logGroupName && (
          <LogModal
            isOpen={state.app.isLogModalOpen}
            onClose={actions.closeLogModal}
            feature={state.app.logFeature}
            platform={state.app.logPlatform}
            groupName={state.app.logGroupName}
          />
        )}
    </section>
  );
};
