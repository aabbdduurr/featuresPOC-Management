import React from 'react';
import { PlatformDropdown } from '../PlatformDropdown/PlatformDropdown';
import { ActionButton } from '../shared/ActionButton/ActionButton';
import { useApp } from '../../context/SimpleContext';
import './PlatformSection.css';

export const PlatformSection: React.FC = () => {
  const { actions } = useApp();

  return (
    <section className="platform-section">
      <div className="platform-controls">
        <PlatformDropdown />
        <ActionButton
          variant="primary"
          onClick={actions.openGroupModal}
          className="add-group-button"
        >
          Add Group
        </ActionButton>
      </div>
    </section>
  );
};
