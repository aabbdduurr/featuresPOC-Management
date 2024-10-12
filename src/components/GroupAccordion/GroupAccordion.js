import React, { useState } from "react";
import FeatureAccordion from "../FeatureAccordion/FeatureAccordion";
import AddFeatureModal from "../AddFeatureModal/AddFeatureModal";
import LogModal from "../LogModal/LogModal";
import FeatureManagementAPI from "../../api/featureManagementAPI";
import "./GroupAccordion.css";

const GroupAccordion = ({ groups, platform, refreshData }) => {
  const [activeGroup, setActiveGroup] = useState(null);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Toggle group expand/collapse
  const handleGroupClick = (groupId) => {
    setActiveGroup(activeGroup === groupId ? null : groupId);
  };

  // Open modal to add a feature
  const handleAddFeature = (group) => {
    setSelectedGroup(group);
    setIsFeatureModalOpen(true);
  };

  const handleViewGroupLogs = (group) => {
    setSelectedGroup(group);
    setIsLogModalOpen(true);
  };

  // Create a new feature
  const handleFeatureCreate = (newFeature) => {
    setLoading(true);
    setError("");

    FeatureManagementAPI.createFeature(platform, selectedGroup.id, newFeature)
      .then(() => {
        refreshData(); // Refresh platform data after creating feature
        setIsFeatureModalOpen(false); // Close modal on success
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error creating feature:", error);
        setError("Error creating feature");
        setIsFeatureModalOpen(false); // Close modal even on error
        setLoading(false);
      });
  };

  // Delete a group
  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      setLoading(true);
      FeatureManagementAPI.deleteGroup(platform, groupId)
        .then(() => {
          refreshData(); // Refresh platform data after deleting group
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error deleting group:", error);
          setError("Error deleting group");
          setLoading(false);
        });
    }
  };

  return (
    <div className="group-accordion">
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {groups.length > 0 ? (
        groups.map((group) => (
          <div key={group.id} className="group-item">
            <div
              className="group-header"
              onClick={() => handleGroupClick(group.id)}
            >
              <span>{group.description}</span>
              <div className="group-actions">
                <button
                  className="log-button"
                  onClick={() => handleViewGroupLogs(group)}
                >
                  Log
                </button>
                <button
                  className="add-feature-button"
                  onClick={() => handleAddFeature(group)}
                >
                  Add Feature
                </button>
                <button
                  className="delete-group-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent collapsing group
                    handleDeleteGroup(group.id);
                  }}
                >
                  Delete Group
                </button>
              </div>
            </div>
            {activeGroup === group.id && (
              <div className="group-content">
                {group.features.length > 0 ? (
                  group.features.map((feature) => (
                    <div key={feature.id} className="feature-container">
                      <FeatureAccordion
                        key={feature.id}
                        feature={feature}
                        platform={platform}
                        groupId={group.id} // Pass groupId
                        refreshData={refreshData} // Pass refreshData function
                      />
                    </div>
                  ))
                ) : (
                  <p>No features yet.</p>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No groups available for this platform.</p>
      )}
      {isFeatureModalOpen && (
        <AddFeatureModal
          onClose={() => setIsFeatureModalOpen(false)}
          onCreate={handleFeatureCreate}
        />
      )}

      {isLogModalOpen && (
        <LogModal
          platform={platform}
          groupId={selectedGroup.id} // Pass group ID for logs
          onClose={() => setIsLogModalOpen(false)}
        />
      )}
    </div>
  );
};

export default GroupAccordion;
