import React from 'react';
import { ActionButton } from '../shared/ActionButton/ActionButton';
import { useApp } from '../../context/SimpleContext';
import './Header.css';

export const Header: React.FC = () => {
  const { actions } = useApp();

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Feature Management System</h1>
        <p className="header-subtitle">Manage and control feature flags across your platforms</p>
        <div className="header-actions">
          <ActionButton variant="secondary" onClick={actions.openCreateSegmentModal}>
            Create Segment
          </ActionButton>
        </div>
      </div>
    </header>
  );
};
