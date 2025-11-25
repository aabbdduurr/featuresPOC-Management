import React, { useState } from 'react';
import { Modal } from '../../shared/Modal/Modal';
import { ActionButton } from '../../shared/ActionButton/ActionButton';
import { useApp } from '../../../context/SimpleContext';
import { useGroupManagement } from '../../../hooks';
import { isValidId, sanitizeInput } from '../../../../shared/utils';
import './AddGroupModal.css';

interface AddGroupModalProps {
  onRefresh: () => void;
}

export const AddGroupModal: React.FC<AddGroupModalProps> = ({ onRefresh }) => {
  const { state, actions } = useApp();
  const { createGroup, loading, error } = useGroupManagement(state.app.selectedPlatform);

  const [formData, setFormData] = useState({
    id: '',
    description: '',
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.id.trim()) {
      errors.push('Group ID is required');
    } else if (!isValidId(formData.id.trim())) {
      errors.push('Group ID can only contain letters, numbers, hyphens, and underscores');
    }

    if (!formData.description.trim()) {
      errors.push('Group description is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await createGroup({
      id: formData.id.trim(),
      description: sanitizeInput(formData.description.trim()),
    });

    if (success) {
      actions.closeGroupModal();
      onRefresh();
      setFormData({ id: '', description: '' });
      setValidationErrors([]);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));

    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleClose = () => {
    actions.closeGroupModal();
    setFormData({ id: '', description: '' });
    setValidationErrors([]);
  };

  return (
    <Modal isOpen={state.app.isGroupModalOpen} onClose={handleClose} title="Add New Group">
      <form onSubmit={handleSubmit} className="add-group-form">
        <div className="form-field">
          <label htmlFor="group-id" className="form-field__label">
            Group ID *
          </label>
          <input
            id="group-id"
            type="text"
            value={formData.id}
            onChange={handleInputChange('id')}
            className="form-field__input"
            placeholder="e.g., ui-features"
            maxLength={50}
            disabled={loading}
            aria-describedby="group-id-help"
          />
          <div id="group-id-help" className="form-field__help">
            Unique identifier for the group (letters, numbers, hyphens, underscores only)
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="group-description" className="form-field__label">
            Description *
          </label>
          <input
            id="group-description"
            type="text"
            value={formData.description}
            onChange={handleInputChange('description')}
            className="form-field__input"
            placeholder="e.g., User Interface Features"
            maxLength={100}
            disabled={loading}
          />
        </div>

        {validationErrors.length > 0 && (
          <div className="form-errors" role="alert">
            <ul className="form-errors__list">
              {validationErrors.map((error, index) => (
                <li key={index} className="form-errors__item">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <div className="modal-actions">
          <ActionButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!formData.id.trim() || !formData.description.trim()}
          >
            Create Group
          </ActionButton>
          <ActionButton type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </ActionButton>
        </div>
      </form>
    </Modal>
  );
};
