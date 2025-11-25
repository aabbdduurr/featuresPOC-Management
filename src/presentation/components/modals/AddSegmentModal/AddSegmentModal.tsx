import React, { useState, useEffect } from 'react';
import { Modal } from '../../shared/Modal/Modal';
import { ActionButton } from '../../shared/ActionButton/ActionButton';
import { useApp } from '../../../context/SimpleContext';
import { useSegmentManagement, useSegmentData } from '../../../hooks/index';
import { Feature, SegmentCombination, SegmentData } from '../../../../shared/types';
import { sanitizeInput } from '../../../../shared/utils';
import './AddSegmentModal.css';

interface AddSegmentModalProps {
  feature: Feature;
  onRefresh: () => void;
  existingSegmentIndex?: number;
}

interface SegmentRow {
  segmentType: string;
  values: string[];
  include: boolean;
}

export const AddSegmentModal: React.FC<AddSegmentModalProps> = ({
  feature,
  onRefresh,
  existingSegmentIndex,
}) => {
  const { state, actions } = useApp();
  const { createSegment, updateSegment, loading } = useSegmentManagement();
  const { segmentData, loading: segmentLoading, error: segmentError } = useSegmentData();

  const isEditMode = existingSegmentIndex !== undefined;
  const existingSegment = isEditMode ? feature.segments?.[existingSegmentIndex] : null;

  const [segmentRows, setSegmentRows] = useState<SegmentRow[]>([]);
  const [segmentValue, setSegmentValue] = useState<any>('');
  const [rolloutEnabled, setRolloutEnabled] = useState(false);
  const [rolloutPercentage, setRolloutPercentage] = useState(0);
  const [secondaryValue, setSecondaryValue] = useState<any>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (segmentData) {
      if (existingSegment) {
        initializeFromExisting(existingSegment);
      } else {
        initializeEmpty();
      }
    }
  }, [segmentData, existingSegment]);

  const initializeFromExisting = (segment: any) => {
    const rows: SegmentRow[] = Object.entries(segment.combo || {}).map(
      ([segmentType, values]: [string, any]) => {
        const valuesArray = Array.isArray(values) ? values : [values];
        const cleanValues = valuesArray.map((v: string) => (v.startsWith('!') ? v.slice(1) : v));
        const isInclude = Array.isArray(values)
          ? !values.some((v: string) => v.startsWith('!'))
          : !values.startsWith('!');

        return {
          segmentType,
          values: cleanValues,
          include: isInclude,
        };
      }
    );

    setSegmentRows(rows);
    setSegmentValue(
      segment.value !== undefined ? segment.value : feature.type === 'boolean' ? false : ''
    );
    setRolloutEnabled(!!segment.rollout);
    setRolloutPercentage(segment.rollout?.percentage || 0);
    setSecondaryValue(
      segment.rollout?.secondaryValue !== undefined
        ? segment.rollout?.secondaryValue
        : feature.type === 'boolean'
          ? false
          : ''
    );
  };

  const initializeEmpty = () => {
    setSegmentRows([{ segmentType: '', values: [], include: true }]);
    setSegmentValue(feature.type === 'boolean' ? false : '');
    setRolloutEnabled(false);
    setRolloutPercentage(0);
    setSecondaryValue(feature.type === 'boolean' ? false : '');
  };

  const addSegmentRow = () => {
    setSegmentRows([...segmentRows, { segmentType: '', values: [], include: true }]);
  };

  const removeSegmentRow = (index: number) => {
    setSegmentRows(segmentRows.filter((_, i) => i !== index));
  };

  const updateSegmentRow = (index: number, field: keyof SegmentRow, value: any) => {
    const updated = [...segmentRows];
    updated[index] = { ...updated[index], [field]: value };
    setSegmentRows(updated);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (segmentRows.length === 0) {
      errors.push('At least one segment is required');
    }

    segmentRows.forEach((row, index) => {
      if (!row.segmentType) {
        errors.push(`Segment ${index + 1}: Type is required`);
      }
      if (row.values.length === 0) {
        errors.push(`Segment ${index + 1}: At least one value is required`);
      }
    });

    const segmentTypes = segmentRows.map(row => row.segmentType).filter(Boolean);
    const uniqueTypes = new Set(segmentTypes);
    if (uniqueTypes.size !== segmentTypes.length) {
      errors.push('Duplicate segment types are not allowed');
    }

    if (segmentValue === '' || segmentValue === null || segmentValue === undefined) {
      errors.push('Segment value is required');
    }

    if (rolloutEnabled) {
      if (rolloutPercentage < 0 || rolloutPercentage > 100) {
        errors.push('Rollout percentage must be between 0 and 100');
      }
      if (secondaryValue === '' || secondaryValue === null || secondaryValue === undefined) {
        errors.push('Secondary value is required when rollout is enabled');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const segmentCombination: SegmentCombination = {};
    segmentRows.forEach(row => {
      if (row.segmentType && row.values.length > 0) {
        segmentCombination[row.segmentType] = row.include
          ? row.values
          : row.values.map(v => `!${v}`);
      }
    });

    const combo: SegmentCombination = { ...segmentCombination };

    const segmentData = {
      combo,
      segmentCombination,
      value: feature.type === 'number' ? Number(segmentValue) : segmentValue,
      rollout: rolloutEnabled
        ? {
            percentage: rolloutPercentage,
            secondaryValue: feature.type === 'number' ? Number(secondaryValue) : secondaryValue,
          }
        : null,
    };

    const success =
      isEditMode && existingSegmentIndex !== undefined
        ? await updateSegment(feature.id, existingSegmentIndex, segmentData)
        : await createSegment(feature.id, segmentData);

    if (success) {
      onRefresh();
      handleClose();
    }
  };

  const handleClose = () => {
    actions.closeSegmentModal();
    setValidationErrors([]);
  };

  if (segmentLoading) {
    return (
      <Modal isOpen={true} onClose={handleClose} title="Loading...">
        <p>Loading segment data...</p>
      </Modal>
    );
  }

  if (segmentError || !segmentData) {
    return (
      <Modal isOpen={true} onClose={handleClose} title="Error">
        <p>Error loading segment data: {segmentError || 'Unknown error'}</p>
        <div className="modal-actions">
          <ActionButton variant="secondary" onClick={handleClose}>
            Close
          </ActionButton>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={isEditMode ? 'Edit Segment Override' : 'Add Segment Override'}
      className="add-segment-modal"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Segment Configuration</h3>

          {segmentRows.map((row, index) => (
            <div key={index} className="segment-row">
              <div className="segment-row-header">
                <h4>Segment {index + 1}</h4>
                {!isEditMode && segmentRows.length > 1 && (
                  <ActionButton
                    variant="danger"
                    size="small"
                    onClick={() => removeSegmentRow(index)}
                  >
                    Remove
                  </ActionButton>
                )}
              </div>

              <div className="form-group">
                <label htmlFor={`segmentType-${index}`}>Segment Type</label>
                <select
                  id={`segmentType-${index}`}
                  value={row.segmentType}
                  onChange={e => updateSegmentRow(index, 'segmentType', e.target.value)}
                  disabled={isEditMode}
                >
                  <option value="">Select Segment Type</option>
                  {Object.entries(segmentData).map(([key, segment]) => (
                    <option key={key} value={key}>
                      {segment.description}
                    </option>
                  ))}
                </select>
              </div>

              {row.segmentType && (
                <div className="form-group">
                  <label htmlFor={`values-${index}`}>Values</label>
                  <select
                    id={`values-${index}`}
                    multiple
                    value={row.values}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      updateSegmentRow(index, 'values', selected);
                    }}
                    disabled={isEditMode}
                    size={Math.min(6, segmentData[row.segmentType]?.values.length || 1)}
                  >
                    {segmentData[row.segmentType]?.values.map(value => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <small>Hold Ctrl/Cmd to select multiple values</small>
                </div>
              )}

              <div className="form-group">
                <label htmlFor={`include-${index}`}>Condition</label>
                <select
                  id={`include-${index}`}
                  value={row.include ? 'in' : 'not-in'}
                  onChange={e => updateSegmentRow(index, 'include', e.target.value === 'in')}
                >
                  <option value="in">Is in selected values</option>
                  <option value="not-in">Is not in selected values</option>
                </select>
              </div>
            </div>
          ))}

          {!isEditMode && (
            <ActionButton variant="secondary" onClick={addSegmentRow} type="button">
              Add Another Segment
            </ActionButton>
          )}
        </div>

        <div className="form-section">
          <h3>Value Configuration</h3>

          <div className="form-group">
            <label htmlFor="segmentValue">Value for this segment</label>
            {feature.type === 'boolean' ? (
              <input
                type="checkbox"
                id="segmentValue"
                checked={segmentValue === true}
                onChange={e => setSegmentValue(e.target.checked)}
              />
            ) : (
              <input
                type={feature.type === 'number' ? 'number' : 'text'}
                id="segmentValue"
                value={segmentValue}
                onChange={e => setSegmentValue(e.target.value)}
              />
            )}
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={rolloutEnabled}
                onChange={e => setRolloutEnabled(e.target.checked)}
              />
              Enable gradual rollout
            </label>
          </div>

          {rolloutEnabled && (
            <div className="rollout-config">
              <div className="form-group">
                <label htmlFor="rolloutPercentage">Rollout Percentage: {rolloutPercentage}%</label>
                <input
                  type="range"
                  id="rolloutPercentage"
                  min="0"
                  max="100"
                  value={rolloutPercentage}
                  onChange={e => setRolloutPercentage(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="secondaryValue">Secondary Value (for remaining users)</label>
                {feature.type === 'boolean' ? (
                  <input
                    type="checkbox"
                    id="secondaryValue"
                    checked={secondaryValue === true}
                    onChange={e => setSecondaryValue(e.target.checked)}
                  />
                ) : (
                  <input
                    type={feature.type === 'number' ? 'number' : 'text'}
                    id="secondaryValue"
                    value={secondaryValue}
                    onChange={e => setSecondaryValue(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <h4>Please fix the following errors:</h4>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="modal-actions">
          <ActionButton type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Segment' : 'Create Segment'}
          </ActionButton>
          <ActionButton type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </ActionButton>
        </div>
      </form>
    </Modal>
  );
};
