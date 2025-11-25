import React, { useState } from 'react';
import { Modal } from '../../shared/Modal/Modal';
import { ActionButton } from '../../shared/ActionButton/ActionButton';
import { useApp } from '../../../context/SimpleContext';
import { useFeatureManagement } from '../../../hooks';
import { isValidId, sanitizeInput } from '../../../../shared/utils';
import './AddFeatureModal.css';

interface AddFeatureModalProps {
  groupId: string;
  onRefresh: () => void;
}

export const AddFeatureModal: React.FC<AddFeatureModalProps> = ({ groupId, onRefresh }) => {
  const { state, actions } = useApp();
  const { createFeature, loading, error } = useFeatureManagement(state.app.selectedPlatform);

  const [formData, setFormData] = useState({
    id: '',
    description: '',
    type: 'boolean' as 'boolean' | 'string' | 'number',
    value: false as any,
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.id.trim()) {
      errors.push('Feature ID is required');
    } else if (!isValidId(formData.id.trim())) {
      errors.push('Feature ID must contain only letters, numbers, hyphens, and underscores');
    }

    if (!formData.description.trim()) {
      errors.push('Description is required');
    }

    if (formData.type === 'number' && isNaN(Number(formData.value))) {
      errors.push('Value must be a valid number for number type');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const featureData = {
      id: sanitizeInput(formData.id.trim()),
      description: sanitizeInput(formData.description.trim()),
      type: formData.type,
      value: formData.type === 'number' ? Number(formData.value) : formData.value,
      groupId: groupId,
    };

    const success = await createFeature(featureData);
    if (success) {
      onRefresh();
      handleClose();
    }
  };

  const handleClose = () => {
    actions.closeFeatureModal();
    setFormData({ id: '', description: '', type: 'boolean', value: false });
    setValidationErrors([]);
  };

  const handleTypeChange = (newType: 'boolean' | 'string' | 'number') => {
    let defaultValue: any = '';
    if (newType === 'boolean') defaultValue = false;
    if (newType === 'number') defaultValue = 0;
    if (newType === 'string') defaultValue = '';

    setFormData(prev => ({
      ...prev,
      type: newType,
      value: defaultValue,
    }));
  };

  return (
    <Modal isOpen={state.app.isFeatureModalOpen} onClose={handleClose} title="Add New Feature">
      <form onSubmit={handleSubmit} className="add-feature-form">
        <div className="form-field">
          <label htmlFor="feature-id" className="form-field__label">
            Feature ID *
          </label>
          <input
            id="feature-id"
            type="text"
            className="form-field__input"
            value={formData.id}
            onChange={e => setFormData(prev => ({ ...prev, id: e.target.value }))}
            placeholder="e.g., new-ui-feature"
            autoFocus
          />
        </div>

        <div className="form-field">
          <label htmlFor="feature-description" className="form-field__label">
            Description *
          </label>
          <input
            id="feature-description"
            type="text"
            className="form-field__input"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the feature"
          />
        </div>

        <div className="form-field">
          <label htmlFor="feature-type" className="form-field__label">
            Type *
          </label>
          <select
            id="feature-type"
            className="form-field__select"
            value={formData.type}
            onChange={e => handleTypeChange(e.target.value as any)}
          >
            <option value="boolean">Boolean</option>
            <option value="string">String</option>
            <option value="number">Number</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="feature-value" className="form-field__label">
            Initial Value *
          </label>
          {formData.type === 'boolean' ? (
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={formData.value}
                onChange={e => setFormData(prev => ({ ...prev, value: e.target.checked }))}
              />
              <span>Enabled</span>
            </label>
          ) : (
            <input
              id="feature-value"
              type={formData.type === 'number' ? 'number' : 'text'}
              className="form-field__input"
              value={formData.value}
              onChange={e => setFormData(prev => ({ ...prev, value: e.target.value }))}
              placeholder={formData.type === 'number' ? '0' : 'Enter value'}
            />
          )}
        </div>

        {validationErrors.length > 0 && (
          <div className="form-errors">
            {validationErrors.map((error, index) => (
              <div key={index} className="form-error">
                {error}
              </div>
            ))}
          </div>
        )}

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <ActionButton type="submit" variant="primary" loading={loading} disabled={loading}>
            {loading ? 'Creating...' : 'Create Feature'}
          </ActionButton>
          <ActionButton type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </ActionButton>
        </div>
      </form>
    </Modal>
  );
};
