import React, { useState } from 'react';
import { Modal } from '../../shared/Modal/Modal';
import { ActionButton } from '../../shared/ActionButton/ActionButton';
import { sanitizeInput } from '../../../../shared/utils';
import './CreatePlatformModal.css';

interface CreatePlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const CreatePlatformModal: React.FC<CreatePlatformModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [platforms, setPlatforms] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const addPlatformField = () => {
    setPlatforms([...platforms, '']);
  };

  const removePlatformField = (index: number) => {
    if (platforms.length > 1) {
      setPlatforms(platforms.filter((_, i) => i !== index));
    }
  };

  const updatePlatform = (index: number, value: string) => {
    const updated = [...platforms];
    updated[index] = sanitizeInput(value);
    setPlatforms(updated);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    const nonEmptyPlatforms = platforms.filter(platform => platform.trim());
    if (nonEmptyPlatforms.length === 0) {
      errors.push('At least one platform name is required');
    }

    const uniquePlatforms = new Set(nonEmptyPlatforms.map(p => p.toLowerCase()));
    if (uniquePlatforms.size !== nonEmptyPlatforms.length) {
      errors.push('Duplicate platform names are not allowed');
    }

    nonEmptyPlatforms.forEach((platform, index) => {
      if (platform.length < 2) {
        errors.push(`Platform ${index + 1}: Name must be at least 2 characters long`);
      }
      if (!/^[a-zA-Z0-9-_\s]+$/.test(platform)) {
        errors.push(
          `Platform ${index + 1}: Name can only contain letters, numbers, hyphens, underscores, and spaces`
        );
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const nonEmptyPlatforms = platforms.filter(platform => platform.trim());
      const authToken = localStorage.getItem('authToken') || process.env.REACT_APP_AUTH_TOKEN;

      const response = await fetch(process.env.REACT_APP_API_BASE_URL!, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add-platform',
          newPlatforms: nonEmptyPlatforms,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to create platforms: ${response.status} ${response.statusText}\n${errorData}`
        );
      }

      setPlatforms(['']);
      setValidationErrors([]);

      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error creating platforms:', error);
      setValidationErrors([error instanceof Error ? error.message : 'Failed to create platforms']);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setPlatforms(['']);
      setValidationErrors([]);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Platforms">
      <form onSubmit={handleSubmit} className="create-platform-form">
        <div className="platform-fields">
          <label className="form-label">
            Platform Names
            <span className="form-label-note">Add one or more platform names</span>
          </label>

          {platforms.map((platform, index) => (
            <div key={index} className="platform-field-row">
              <input
                type="text"
                className="form-input"
                value={platform}
                onChange={e => updatePlatform(index, e.target.value)}
                placeholder={`Platform name ${index + 1}`}
                disabled={loading}
                required={index === 0}
              />
              {platforms.length > 1 && (
                <ActionButton
                  type="button"
                  variant="danger"
                  size="small"
                  onClick={() => removePlatformField(index)}
                  disabled={loading}
                >
                  Remove
                </ActionButton>
              )}
            </div>
          ))}

          <ActionButton
            type="button"
            variant="secondary"
            onClick={addPlatformField}
            disabled={loading}
            className="add-platform-btn"
          >
            + Add Another Platform
          </ActionButton>
        </div>

        {validationErrors.length > 0 && (
          <div className="validation-errors">
            {validationErrors.map((error, index) => (
              <p key={index} className="error-message">
                {error}
              </p>
            ))}
          </div>
        )}

        <div className="form-note">
          <p>
            <strong>Platform Naming Guidelines:</strong>
          </p>
          <ul>
            <li>Use descriptive names like "mobile-app", "web-dashboard", "admin-panel"</li>
            <li>Names must be at least 2 characters long</li>
            <li>Can contain letters, numbers, hyphens, underscores, and spaces</li>
            <li>Duplicate names are not allowed</li>
          </ul>
        </div>

        <div className="modal-actions">
          <ActionButton type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </ActionButton>
          <ActionButton type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Platforms'}
          </ActionButton>
        </div>
      </form>
    </Modal>
  );
};
