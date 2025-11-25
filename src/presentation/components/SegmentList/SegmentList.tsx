import React from 'react';
import { ActionButton } from '../shared/ActionButton/ActionButton';
import './SegmentList.css';

interface Segment {
  combo: Record<string, string[]>;
  value: any;
  rollout?: {
    percentage: number;
    secondaryValue: any;
  } | null;
}

interface SegmentListProps {
  segments: Segment[];
  onEditSegment: (index: number) => void;
  onDeleteSegment: (index: number) => void;
  onMoveSegmentUp: (index: number) => void;
  onMoveSegmentDown: (index: number) => void;
}

export const SegmentList: React.FC<SegmentListProps> = ({
  segments,
  onEditSegment,
  onDeleteSegment,
  onMoveSegmentUp,
  onMoveSegmentDown,
}) => {
  if (segments.length === 0) {
    return (
      <div className="segment-list">
        <h3>Segment Overrides</h3>
        <p className="no-segments">No segment overrides configured.</p>
      </div>
    );
  }

  return (
    <div className="segment-list">
      <h3>Segment Overrides</h3>
      <div className="segment-table-container">
        <table className="segment-table">
          <thead>
            <tr>
              <th>Segment Conditions</th>
              <th>Value</th>
              <th>Rollout</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment, index) => (
              <tr key={index}>
                <td className="segment-conditions">
                  {Object.entries(segment.combo).map(([segmentType, values]) => (
                    <div key={segmentType} className="condition-row">
                      <span className="condition-type">{segmentType}</span>
                      <span className="condition-operator">
                        {values[0]?.startsWith('!') ? 'NOT IN' : 'IN'}
                      </span>
                      <span className="condition-values">
                        {values.map(v => (v.startsWith('!') ? v.slice(1) : v)).join(', ')}
                      </span>
                    </div>
                  ))}
                </td>

                <td className="segment-value">
                  <span className="value-display">{segment.value?.toString()}</span>
                </td>

                <td className="segment-rollout">
                  {segment.rollout ? (
                    <div className="rollout-info">
                      <div className="rollout-bar-container">
                        <div className="rollout-bar">
                          <div
                            className="rollout-progress"
                            style={{ width: `${segment.rollout.percentage}%` }}
                          />
                        </div>
                        <span className="rollout-percentage">{segment.rollout.percentage}%</span>
                      </div>
                      <div className="rollout-secondary">
                        Secondary: <strong>{segment.rollout.secondaryValue?.toString()}</strong>
                      </div>
                    </div>
                  ) : (
                    <span className="no-rollout">No Rollout</span>
                  )}
                </td>

                <td className="segment-actions">
                  <div className="action-buttons">
                    <ActionButton
                      variant="secondary"
                      size="small"
                      onClick={() => onEditSegment(index)}
                    >
                      ✏️
                    </ActionButton>

                    <ActionButton
                      variant="danger"
                      size="small"
                      onClick={() => onDeleteSegment(index)}
                    >
                      🗑️
                    </ActionButton>

                    <div className="move-buttons">
                      <ActionButton
                        variant="secondary"
                        size="small"
                        onClick={() => onMoveSegmentUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </ActionButton>

                      <ActionButton
                        variant="secondary"
                        size="small"
                        onClick={() => onMoveSegmentDown(index)}
                        disabled={index === segments.length - 1}
                      >
                        ↓
                      </ActionButton>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
