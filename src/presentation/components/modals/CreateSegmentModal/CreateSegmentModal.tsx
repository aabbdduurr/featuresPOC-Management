import React, { useState } from 'react';
import { Modal } from '../../shared/Modal/Modal';
import { ActionButton } from '../../shared/ActionButton/ActionButton';
import { useApp } from '../../../context/SimpleContext';
import { useSegmentManagement } from '../../../hooks/useSegmentManagement';
import './CreateSegmentModal.css';

interface CreateSegmentModalProps {
  onRefresh: () => void;
}

export const CreateSegmentModal: React.FC<CreateSegmentModalProps> = ({ onRefresh }) => {
  const {
    state: {
      app: { isCreateSegmentModalOpen },
    },
    actions: { closeCreateSegmentModal },
  } = useApp();
  const { createSegment, loading } = useSegmentManagement();
  const [segmentName, setSegmentName] = useState('');
  const [description, setDescription] = useState('');
  const [values, setValues] = useState<string[]>(['']);

  const handleAddValue = () => {
    setValues([...values, '']);
  };

  const handleRemoveValue = (index: number) => {
    if (values.length > 1) {
      setValues(values.filter((_, i) => i !== index));
    }
  };

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanValues = values.filter(v => v.trim());
    if (!segmentName.trim() || !description.trim() || cleanValues.length === 0) {
      return;
    }

    try {
      await createSegment(segmentName.trim(), description.trim(), cleanValues);
      setSegmentName('');
      setDescription('');
      setValues(['']);
      onRefresh();
      closeCreateSegmentModal();
    } catch (error) {
      console.error('Error creating segment:', error);
    }
  };

  const handleClose = () => {
    setSegmentName('');
    setDescription('');
    setValues(['']);
    closeCreateSegmentModal();
  };

  if (!isCreateSegmentModalOpen) return null;

  return (
    <Modal isOpen={isCreateSegmentModalOpen} onClose={handleClose} title="Create New Segment">
      <form onSubmit={handleSubmit} className="create-segment-form">
        <div className="form-group">
          <label htmlFor="segment-name">Segment Name:</label>
          <input
            id="segment-name"
            type="text"
            value={segmentName}
            onChange={e => setSegmentName(e.target.value)}
            placeholder="e.g., user-tier, region, device-type"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="segment-description">Description:</label>
          <input
            id="segment-description"
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe what this segment represents"
            required
          />
        </div>

        <div className="form-group">
          <label>Possible Values:</label>
          {values.map((value, index) => (
            <div key={index} className="value-input-row">
              <input
                type="text"
                value={value}
                onChange={e => handleValueChange(index, e.target.value)}
                placeholder={`Value ${index + 1}`}
                required={index === 0}
              />
              {values.length > 1 && (
                <ActionButton
                  type="button"
                  variant="danger"
                  size="small"
                  onClick={() => handleRemoveValue(index)}
                >
                  Remove
                </ActionButton>
              )}
            </div>
          ))}
          <ActionButton type="button" variant="secondary" onClick={handleAddValue}>
            Add Value
          </ActionButton>
        </div>

        <div className="modal-actions">
          <ActionButton type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </ActionButton>
          <ActionButton type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Segment'}
          </ActionButton>
        </div>
      </form>
    </Modal>
  );
};
