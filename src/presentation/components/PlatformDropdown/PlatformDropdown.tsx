import React from 'react';
import { usePlatforms } from '../../hooks';
import { useApp } from '../../context/SimpleContext';
import { ActionButton } from '../shared/ActionButton/ActionButton';
import './PlatformDropdown.css';

export const PlatformDropdown: React.FC = () => {
  const { platforms, loading, error } = usePlatforms();
  const { state, actions } = useApp();

  const handlePlatformChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlatform = event.target.value;
    actions.setPlatform(selectedPlatform || null);
  };

  if (loading) {
    return (
      <div className="platform-dropdown">
        <div className="platform-dropdown__loading">Loading platforms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="platform-dropdown">
        <div className="platform-dropdown__error" role="alert">
          Error loading platforms: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="platform-dropdown">
      <label htmlFor="platform-select" className="platform-dropdown__label">
        Select Platform:
      </label>
      <div className="platform-dropdown__controls">
        <select
          id="platform-select"
          className="platform-dropdown__select"
          value={state.app.selectedPlatform || ''}
          onChange={handlePlatformChange}
          aria-label="Select a platform"
        >
          <option value="">
            {platforms.length === 0
              ? 'No platforms available - create one first'
              : 'Choose a platform...'}
          </option>
          {platforms.map(platform => (
            <option key={platform} value={platform}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </option>
          ))}
        </select>
        <ActionButton variant="secondary" size="small" onClick={actions.openCreatePlatformModal}>
          + Create Platform
        </ActionButton>
      </div>
    </div>
  );
};
