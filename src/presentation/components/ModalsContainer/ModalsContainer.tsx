import React from 'react';
import { AddGroupModal } from '../modals/AddGroupModal/AddGroupModal';
import { AddFeatureModal } from '../modals/AddFeatureModal/AddFeatureModal';
import { FeatureEditModal } from '../modals/FeatureEditModal/FeatureEditModal';
import { AddSegmentModal } from '../modals/AddSegmentModal/AddSegmentModal';
import { CreateSegmentModal } from '../modals/CreateSegmentModal/CreateSegmentModal';
import { CreatePlatformModal } from '../modals/CreatePlatformModal/CreatePlatformModal';
import { useApp } from '../../context/SimpleContext';

interface ModalsContainerProps {
  onRefresh: () => void;
}

export const ModalsContainer: React.FC<ModalsContainerProps> = ({ onRefresh }) => {
  const { state, actions } = useApp();

  return (
    <>
      {state.app.isGroupModalOpen && <AddGroupModal onRefresh={onRefresh} />}
      {state.app.isFeatureModalOpen && state.app.selectedGroupId && (
        <AddFeatureModal groupId={state.app.selectedGroupId} onRefresh={onRefresh} />
      )}
      {state.app.isEditModalOpen && state.app.editingFeature && (
        <FeatureEditModal feature={state.app.editingFeature} onRefresh={onRefresh} />
      )}
      {state.app.isSegmentModalOpen && state.app.selectedFeature && (
        <AddSegmentModal
          feature={state.app.selectedFeature}
          existingSegmentIndex={
            state.app.editingSegmentIndex !== null ? state.app.editingSegmentIndex : undefined
          }
          onRefresh={onRefresh}
        />
      )}
      {state.app.isCreateSegmentModalOpen && <CreateSegmentModal onRefresh={onRefresh} />}
      {state.app.isCreatePlatformModalOpen && (
        <CreatePlatformModal
          isOpen={state.app.isCreatePlatformModalOpen}
          onClose={actions.closeCreatePlatformModal}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
};
