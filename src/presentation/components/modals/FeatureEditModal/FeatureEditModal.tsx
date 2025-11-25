import React, { useState, useEffect } from 'react';
import { Modal } from '../../shared/Modal/Modal';
import { ActionButton } from '../../shared/ActionButton/ActionButton';
import { useApp } from '../../../context/SimpleContext';
import { useFeatureManagement } from '../../../hooks';
import { Feature, FeatureValue, Rollout } from '../../../../shared/types';
import './FeatureEditModal.css';

interface FeatureEditModalProps {
  feature: Feature;
  onRefresh: () => void;
}

export const FeatureEditModal: React.FC<FeatureEditModalProps> = ({ feature, onRefresh }) => {
  const { state, actions } = useApp();
  const { updateFeatureValue, loading, error } = useFeatureManagement(state.app.selectedPlatform);

  const [formData, setFormData] = useState({
    value: feature.value,
    rolloutEnabled: !!feature.rollout,
    rolloutPercentage: feature.rollout?.percentage || 0,
    secondaryValue: feature.rollout?.secondaryValue || (feature.type === 'boolean' ? false : ''),
  });

  useEffect(() => {
    if (feature.type === 'boolean' && formData.secondaryValue === '') {
      setFormData(prev => ({ ...prev, secondaryValue: false }));
    }
  }, [feature.type, formData.secondaryValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let adjustedValue: FeatureValue = formData.value;
    let adjustedSecondaryValue: FeatureValue = formData.secondaryValue;

    if (feature.type === 'boolean') {
      adjustedValue = Boolean(formData.value);
      adjustedSecondaryValue = Boolean(formData.secondaryValue);
    } else if (feature.type === 'number') {
      adjustedValue = Number(formData.value);
      adjustedSecondaryValue = Number(formData.secondaryValue);
    }

    const rollout: Rollout | null = formData.rolloutEnabled
      ? {
          percentage: formData.rolloutPercentage,
          secondaryValue: adjustedSecondaryValue,
        }
      : null;

    const success = await updateFeatureValue(feature.id, adjustedValue, {}, rollout);

    if (success) {
      onRefresh();
      handleClose();
    }
  };

  const handleClose = () => {
    actions.closeEditModal();
  };

  return (
    <Modal
      isOpen={state.app.isEditModalOpen}
      onClose={handleClose}
      title={`Edit Feature: ${feature.id}`}
    >
      <form onSubmit={handleSubmit} className="edit-feature-form">
        <div className="feature-info">
          <p>
            <strong>Description:</strong> {feature.description}
          </p>
          <p>
            <strong>Type:</strong> {feature.type}
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="feature-value" className="form-field__label">
            Value *
          </label>
          {feature.type === 'boolean' ? (
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={Boolean(formData.value)}
                onChange={e => setFormData(prev => ({ ...prev, value: e.target.checked }))}
              />
              <span>Enabled</span>
            </label>
          ) : (
            <input
              id="feature-value"
              type={feature.type === 'number' ? 'number' : 'text'}
              className="form-field__input"
              value={String(formData.value)}
              onChange={e => {
                const newValue =
                  feature.type === 'number' ? Number(e.target.value) : e.target.value;
                setFormData(prev => ({ ...prev, value: newValue }));
              }}
            />
          )}
        </div>

        <div className="rollout-section">
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={formData.rolloutEnabled}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  rolloutEnabled: e.target.checked,
                  rolloutPercentage: e.target.checked ? prev.rolloutPercentage : 0,
                }))
              }
            />
            <span>Enable Rollout</span>
          </label>

          {formData.rolloutEnabled && (
            <>
              <div className="form-field">
                <label htmlFor="rollout-percentage" className="form-field__label">
                  Rollout Percentage: {formData.rolloutPercentage}%
                </label>
                <input
                  id="rollout-percentage"
                  type="range"
                  min="0"
                  max="100"
                  className="rollout-slider"
                  value={formData.rolloutPercentage}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      rolloutPercentage: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="secondary-value" className="form-field__label">
                  Secondary Value (for {100 - formData.rolloutPercentage}% of users)
                </label>
                {feature.type === 'boolean' ? (
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.secondaryValue)}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          secondaryValue: e.target.checked,
                        }))
                      }
                    />
                    <span>Enabled</span>
                  </label>
                ) : (
                  <input
                    id="secondary-value"
                    type={feature.type === 'number' ? 'number' : 'text'}
                    className="form-field__input"
                    value={String(formData.secondaryValue)}
                    onChange={e => {
                      const newValue =
                        feature.type === 'number' ? Number(e.target.value) : e.target.value;
                      setFormData(prev => ({ ...prev, secondaryValue: newValue }));
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <ActionButton type="submit" variant="primary" loading={loading} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </ActionButton>
          <ActionButton type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </ActionButton>
        </div>
      </form>
    </Modal>
  );
};
