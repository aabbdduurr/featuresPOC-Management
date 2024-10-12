import React, { useState, useEffect } from "react";
import "./AddSegmentModal.css";
import FeatureManagementAPI from "../../api/featureManagementAPI";

const AddSegmentModal = ({
  segmentsData,
  featureId,
  featureType,
  platform,
  onClose,
  refreshData,
  existingSegment, // Pass in the existing segment for editing
  isEditMode, // Flag to indicate whether it's in edit mode or add mode
}) => {
  // State for segment combination, initialized with existing data if editing
  const [segmentCombination, setSegmentCombination] = useState(
    existingSegment?.combo
      ? Object.entries(existingSegment.combo).map(([segmentType, values]) => ({
          segmentType,
          values: values.map((value) =>
            value.startsWith("!") ? value.slice(1) : value
          ),
          include: !values[0].startsWith("!"),
        }))
      : []
  );
  const [segmentValue, setSegmentValue] = useState(
    existingSegment?.value ?? (featureType === "boolean" ? false : "")
  );
  const [rolloutEnabled, setRolloutEnabled] = useState(
    existingSegment?.rollout ? true : false
  );
  const [rolloutPercentage, setRolloutPercentage] = useState(
    existingSegment?.rollout?.percentage || 0
  );
  const [secondaryValue, setSecondaryValue] = useState(
    existingSegment?.rollout?.secondaryValue ||
      (featureType === "boolean" ? false : "")
  );
  const [error, setError] = useState("");

  // Add a new segment to the combination
  const addSegment = () => {
    setSegmentCombination([
      ...segmentCombination,
      { segmentType: "", values: [], include: true },
    ]);
  };

  // Remove a segment from the combination
  const removeSegment = (index) => {
    const updatedCombination = segmentCombination.filter((_, i) => i !== index);
    setSegmentCombination(updatedCombination);
  };

  // Handle updating a segment's type, values, or inclusion/exclusion ("in" or "not in")
  const updateSegment = (index, key, value) => {
    const updatedCombination = [...segmentCombination];
    updatedCombination[index][key] = value;
    setSegmentCombination(updatedCombination);
  };

  // Check for duplicate segments
  const checkForDuplicateSegments = () => {
    const selectedSegmentTypes = segmentCombination.map(
      (segment) => segment.segmentType
    );
    const uniqueSegmentTypes = new Set(selectedSegmentTypes);
    return uniqueSegmentTypes.size !== selectedSegmentTypes.length;
  };

  const handleSave = () => {
    // Validate for duplicate segments
    if (checkForDuplicateSegments()) {
      setError("Duplicate segments are not allowed.");
      return;
    }

    // Prepare the segment combination object for the API
    const combo = segmentCombination.reduce((acc, segment) => {
      if (segment.segmentType) {
        acc[segment.segmentType] = segment.include
          ? segment.values
          : segment.values.map((value) => `!${value}`);
      }
      return acc;
    }, {});

    if (Object.keys(combo).length === 0) {
      setError("Segment combination cannot be empty.");
      return;
    }

    const newSegment = {
      combo, // Segment combination
      value:
        featureType === "boolean"
          ? segmentValue
          : featureType === "number"
          ? Number(segmentValue)
          : segmentValue,
      rollout: rolloutEnabled
        ? {
            percentage: Number(rolloutPercentage),
            secondaryValue:
              featureType === "boolean"
                ? secondaryValue
                : featureType === "number"
                ? Number(secondaryValue)
                : secondaryValue,
          }
        : null,
    };

    // Update the feature's segment and rollout in the backend
    FeatureManagementAPI.updateFeatureValue(
      platform,
      featureId,
      newSegment.value,
      combo, // Pass the segmentCombination object
      newSegment.rollout
    )
      .then(() => {
        refreshData(); // Refresh the data after adding/editing the segment
        onClose(); // Close the modal
      })
      .catch((error) => {
        console.error("Error updating feature:", error);
        setError("Error updating feature.");
      });
  };

  // Ensure segmentsData is loaded before rendering form
  if (!segmentsData) {
    return <p>Loading segment data...</p>;
  }

  return (
    <div className="modal">
      <div className="modal-content scrollable-modal">
        <h2>{isEditMode ? "Edit Segment" : "Add Segment"}</h2>

        {segmentCombination.map((segment, index) => (
          <div key={index} className="segment-row">
            <label>
              Segment Type:
              <select
                value={segment.segmentType}
                onChange={(e) =>
                  updateSegment(index, "segmentType", e.target.value)
                }
                disabled={isEditMode} // Disable the selection in edit mode
              >
                <option value="">Select Segment</option>
                {Object.keys(segmentsData).map((segmentType) => (
                  <option key={segmentType} value={segmentType}>
                    {segmentsData[segmentType].description}
                  </option>
                ))}
              </select>
            </label>

            {segment.segmentType && (
              <label>
                Segment Values:
                <select
                  multiple
                  value={segment.values}
                  onChange={(e) =>
                    updateSegment(
                      index,
                      "values",
                      Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      )
                    )
                  }
                  disabled={isEditMode} // Disable the values in edit mode
                >
                  {segmentsData[segment.segmentType].values.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              Include or Exclude:
              <select
                value={segment.include ? "in" : "not in"}
                onChange={(e) =>
                  updateSegment(index, "include", e.target.value === "in")
                }
              >
                <option value="in">In</option>
                <option value="not in">Not In</option>
              </select>
            </label>

            {!isEditMode && (
              <button
                onClick={() => removeSegment(index)}
                className="remove-segment-button"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        {!isEditMode && <button onClick={addSegment}>Add Segment</button>}

        <label>
          Value:
          {featureType === "boolean" ? (
            <input
              type="checkbox"
              checked={segmentValue === true}
              onChange={(e) => setSegmentValue(e.target.checked)}
            />
          ) : (
            <input
              type={featureType === "number" ? "number" : "text"}
              value={segmentValue}
              onChange={(e) => setSegmentValue(e.target.value)}
            />
          )}
        </label>

        <label>
          <input
            type="checkbox"
            checked={rolloutEnabled}
            onChange={(e) => setRolloutEnabled(e.target.checked)}
          />
          Enable Rollout
        </label>

        {rolloutEnabled && (
          <>
            <label>
              Rollout Percentage:
              <input
                type="range"
                min="0"
                max="100"
                value={rolloutPercentage}
                onChange={(e) => setRolloutPercentage(e.target.value)}
              />
              {rolloutPercentage}%
            </label>

            <label>
              Secondary Value:
              {featureType === "boolean" ? (
                <input
                  type="checkbox"
                  checked={secondaryValue === true}
                  onChange={(e) => setSecondaryValue(e.target.checked)}
                />
              ) : (
                <input
                  type={featureType === "number" ? "number" : "text"}
                  value={secondaryValue}
                  onChange={(e) => setSecondaryValue(e.target.value)}
                />
              )}
            </label>
          </>
        )}

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddSegmentModal;
