import React, { useState, useEffect } from "react";
import FeatureManagementAPI from "../../api/featureManagementAPI";
import "./PlatformDropdown.css";

const PlatformDropdown = ({ onSelect }) => {
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch platforms from the API when the component mounts
    FeatureManagementAPI.getPlatforms()
      .then((data) => {
        setPlatforms(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching platforms");
        setLoading(false);
      });
  }, []);

  const handleSelect = (event) => {
    const platform = event.target.value;
    setSelectedPlatform(platform);
    onSelect(platform); // Trigger the parent component callback
  };

  return (
    <div className="platform-dropdown">
      {loading ? (
        <p>Loading platforms...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <select onChange={handleSelect} value={selectedPlatform}>
          <option value="">Select Platform</option>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default PlatformDropdown;
