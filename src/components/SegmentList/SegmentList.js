import React from "react";
import "./SegmentList.css";

const SegmentList = ({
  segments,
  onEditSegment,
  onDeleteSegment,
  onMoveSegmentUp,
  onMoveSegmentDown,
}) => {
  return (
    <div className="segment-list">
      <h3>Segments</h3>
      {segments.length > 0 ? (
        <table className="segment-table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Value</th>
              <th>Rollout</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment, index) => (
              <tr key={index}>
                <td className="segment-info">
                  {Object.entries(segment.combo).map(([key, values]) => (
                    <div key={key}>
                      <strong>{key}</strong>: {values.join(", ")}
                    </div>
                  ))}
                </td>
                <td>{segment.value.toString()}</td>
                <td>
                  <div className="rollout-info">
                    {segment.rollout ? (
                      <div className="rollout-content">
                        <div className="rollout-slider-container">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={segment.rollout.percentage}
                            readOnly
                            className="rollout-slider"
                          />
                          <span className="rollout-percentage">
                            {segment.rollout.percentage}%
                          </span>
                        </div>
                        <span className="secondary-value">
                          {segment.rollout.secondaryValue.toString()}
                        </span>
                      </div>
                    ) : (
                      <span>No Rollout</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="actions-column">
                    <button
                      className="edit-segment-button"
                      onClick={() => onEditSegment(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-segment-button"
                      onClick={() => onDeleteSegment(index)}
                    >
                      Delete
                    </button>
                    <button
                      className="move-segment-button"
                      onClick={() => onMoveSegmentUp(index)}
                      disabled={index === 0} // Disable if it's the first item
                    >
                      ↑
                    </button>
                    <button
                      className="move-segment-button"
                      onClick={() => onMoveSegmentDown(index)}
                      disabled={index === segments.length - 1} // Disable if it's the last item
                    >
                      ↓
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No segments available for this feature.</p>
      )}
    </div>
  );
};

export default SegmentList;
