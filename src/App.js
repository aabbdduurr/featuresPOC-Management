import React, { useState } from "react";
import PlatformDropdown from "./components/PlatformDropdown/PlatformDropdown";
import GroupAccordion from "./components/GroupAccordion/GroupAccordion";
import AddGroupModal from "./components/AddGroupModal/AddGroupModal";
import FeatureManagementAPI from "./api/featureManagementAPI";

const App = () => {
  const [platform, setPlatform] = useState("");
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Function to fetch platform-specific data when a platform is selected
  const handlePlatformSelect = (selectedPlatform) => {
    setPlatform(selectedPlatform);
    setLoading(true);
    setError("");

    FeatureManagementAPI.getPlatformData(selectedPlatform)
      .then((data) => {
        setPlatformData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching platform data");
        setLoading(false);
      });
  };

  // Handle adding a new group
  const handleGroupCreate = (newGroup) => {
    setLoading(true);
    FeatureManagementAPI.createGroup(platform, newGroup)
      .then(() => {
        return FeatureManagementAPI.getPlatformData(platform);
      })
      .then((data) => {
        setPlatformData(data);
        setLoading(false);
        setIsGroupModalOpen(false); // Close the modal after success
      })
      .catch((err) => {
        setError("Error creating group");
        setLoading(false);
        setIsGroupModalOpen(false); // Close the modal even on error
      });
  };

  // Refresh data after adding features or groups
  const refreshData = () => {
    if (platform) {
      FeatureManagementAPI.getPlatformData(platform)
        .then((data) => setPlatformData(data))
        .catch((err) => setError("Error refreshing data"));
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Feature Management System</h1>
        <div className="top-bar">
          {/* Platform Dropdown */}
          <PlatformDropdown onSelect={handlePlatformSelect} />
          <button onClick={() => setIsGroupModalOpen(true)}>
            Add Group
          </button>{" "}
          {/* Add Group Button */}
        </div>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {platformData ? (
        <GroupAccordion
          groups={platformData.groups}
          platform={platform}
          refreshData={refreshData}
        />
      ) : (
        <p>Please select a platform to load data.</p>
      )}

      {/* Add Group Modal */}
      {isGroupModalOpen && (
        <AddGroupModal
          onClose={() => setIsGroupModalOpen(false)}
          onCreate={handleGroupCreate}
        />
      )}
    </div>
  );
};

export default App;
