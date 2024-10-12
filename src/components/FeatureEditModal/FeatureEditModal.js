import React, { useState, useEffect } from "react";
import FeatureManagementAPI from "../../api/featureManagementAPI";
import "./FeatureEditModal.css";

const FeatureEditModal = ({
  feature,
  platform,
  groupId,
  onClose,
  refreshData,
}) => {
  const [featureValue, setFeatureValue] = useState(feature.value);
  const [rolloutEnabled, setRolloutEnabled] = useState(!!feature.rollout);
  const [rolloutPercentage, setRolloutPercentage] = useState(
    feature.rollout?.percentage || 0
  );
  const [secondaryValue, setSecondaryValue] = useState(
    feature.rollout?.secondaryValue || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (feature.type === "boolean" && secondaryValue === "") {
      // Set default secondary value to false for boolean types
      setSecondaryValue(false);
    }
  }, [feature.type, secondaryValue]);

  const handleSave = () => {
    setLoading(true);
    setError("");

    // Ensure correct type for the main feature value
    const adjustedFeatureValue =
      feature.type === "boolean"
        ? Boolean(featureValue) // Convert to boolean
        : feature.type === "number"
        ? Number(featureValue) // Convert to number
        : featureValue; // Leave as-is for string types

    // Ensure correct type for the secondary value based on feature type
    const adjustedSecondaryValue =
      feature.type === "boolean"
        ? Boolean(secondaryValue) // Convert to boolean
        : feature.type === "number"
        ? Number(secondaryValue) // Convert to number
        : secondaryValue; // Leave as-is for string types

    const updatedFeature = {
      id: feature.id,
      value: adjustedFeatureValue,
      rollout: rolloutEnabled
        ? {
            percentage: Number(rolloutPercentage),
            secondaryValue: adjustedSecondaryValue,
          }
        : null, // Disable rollout if not enabled
    };

    FeatureManagementAPI.updateFeatureValue(
      platform,
      feature.id,
      updatedFeature.value,
      {},
      updatedFeature.rollout
    )
      .then(() => {
        refreshData();
        onClose(); // Close modal on success
      })
      .catch((error) => {
        console.error("Error updating feature:", error);
        setError("Error updating feature");
        setLoading(false);
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Feature</h2>
        <label>
          <strong>Value:</strong>
          {feature.type === "boolean" ? (
            <input
              type="checkbox"
              checked={featureValue === true}
              onChange={(e) => setFeatureValue(e.target.checked)}
            />
          ) : (
            <input
              type={feature.type === "number" ? "number" : "text"}
              value={featureValue}
              onChange={(e) =>
                setFeatureValue(
                  feature.type === "number"
                    ? Number(e.target.value)
                    : e.target.value
                )
              }
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
                onChange={(e) => setRolloutPercentage(Number(e.target.value))}
              />
              {rolloutPercentage}%
            </label>

            <label>
              Secondary Value:
              {feature.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={secondaryValue === true}
                  onChange={(e) => setSecondaryValue(e.target.checked)}
                />
              ) : (
                <input
                  type={feature.type === "number" ? "number" : "text"}
                  value={secondaryValue}
                  onChange={(e) =>
                    setSecondaryValue(
                      feature.type === "number"
                        ? Number(e.target.value)
                        : e.target.value
                    )
                  }
                />
              )}
            </label>
          </>
        )}

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default FeatureEditModal;
