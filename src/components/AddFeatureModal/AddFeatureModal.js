import React, { useState } from "react";
import "./AddFeatureModal.css";

const AddFeatureModal = ({ onClose, onCreate }) => {
  const [featureName, setFeatureName] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featureType, setFeatureType] = useState("boolean"); // Default to 'boolean'
  const [featureValue, setFeatureValue] = useState(false); // Default for boolean type
  const [error, setError] = useState("");

  const handleCreate = () => {
    // Validate input
    if (!featureName || !featureDescription) {
      setError("Both feature name and description are required.");
      return;
    }

    let parsedValue;
    if (featureType === "number") {
      parsedValue = parseFloat(featureValue);
      if (isNaN(parsedValue)) {
        setError("For number type, please enter a valid number.");
        return;
      }
    } else if (featureType === "boolean") {
      parsedValue = featureValue; // Boolean is already in the correct format
    } else {
      parsedValue = featureValue; // Leave as string for "string" type
    }

    // Prepare the new feature data
    const newFeature = {
      id: featureName,
      description: featureDescription,
      type: featureType,
      value: parsedValue, // Use the correctly parsed value
    };

    // Call the onCreate callback with the new feature data
    onCreate(newFeature);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Feature</h2>
        <input
          type="text"
          placeholder="Feature Name"
          value={featureName}
          onChange={(e) => setFeatureName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Feature Description"
          value={featureDescription}
          onChange={(e) => setFeatureDescription(e.target.value)}
        />
        <select
          value={featureType}
          onChange={(e) => {
            setFeatureType(e.target.value);
            setFeatureValue(e.target.value === "boolean" ? false : ""); // Reset value based on type
          }}
        >
          <option value="boolean">Boolean</option>
          <option value="number">Number</option>
          <option value="string">String</option>
        </select>

        {featureType === "boolean" ? (
          <label>
            <input
              type="checkbox"
              checked={featureValue} // Controlled by boolean state
              onChange={(e) => setFeatureValue(e.target.checked)} // Set true/false based on checked state
            />
          </label>
        ) : (
          <input
            type={featureType === "number" ? "number" : "text"}
            placeholder="Initial Value"
            value={featureValue}
            onChange={(e) => setFeatureValue(e.target.value)}
          />
        )}

        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button onClick={handleCreate}>Create Feature</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddFeatureModal;
