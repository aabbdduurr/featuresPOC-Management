import React, { useState, useEffect } from "react";
import "./FeatureAccordion.css";
import FeatureEditModal from "../FeatureEditModal/FeatureEditModal";
import SegmentList from "../SegmentList/SegmentList";
import AddSegmentModal from "../AddSegmentModal/AddSegmentModal";
import LogModal from "../LogModal/LogModal";
import FeatureManagementAPI from "../../api/featureManagementAPI";

const FeatureAccordion = ({ feature, platform, groupId, refreshData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddSegmentModalOpen, setIsAddSegmentModalOpen] = useState(false);
  const [editSegmentIndex, setEditSegmentIndex] = useState(null); // Track index for editing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [segmentOrder, setSegmentOrder] = useState(
    feature.segments.map((_, index) => index) // Initialize order as [0, 1, 2, ...]
  );
  const [segmentsData, setSegmentsData] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  useEffect(() => {
    // Fetch the segment data when the modal is triggered to open
    if (isAddSegmentModalOpen) {
      FeatureManagementAPI.getSegmentData()
        .then((data) => {
          setSegmentsData(data);
        })
        .catch((err) => {
          console.error("Error fetching segments data", err);
          setError("Error fetching segments data");
        });
    }
  }, [isAddSegmentModalOpen]);

  // Reset segment order whenever the feature is updated
  useEffect(() => {
    setSegmentOrder(feature.segments.map((_, index) => index)); // Re-initialize the segment order
  }, [feature.segments]);

  // Toggle expand/collapse for segment listing
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle opening the Add/Edit Segment modal
  const handleOpenAddSegmentModal = (index = null) => {
    setEditSegmentIndex(index);
    setIsAddSegmentModalOpen(true);
  };

  // Handle deleting the entire feature
  const handleDeleteFeature = () => {
    if (window.confirm("Are you sure you want to delete this feature?")) {
      setLoading(true);
      FeatureManagementAPI.deleteFeature(platform, groupId, feature.id)
        .then(() => {
          refreshData();
        })
        .catch((err) => {
          console.error("Error deleting feature:", err);
          setError("Error deleting feature");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // Handle deleting a segment
  const handleDeleteSegment = (index) => {
    const segmentToDelete = feature.segments[index].combo;
    setLoading(true);
    FeatureManagementAPI.deleteSegmentForFeature(
      platform,
      feature.id,
      segmentToDelete
    )
      .then(() => {
        refreshData();
      })
      .catch((err) => {
        console.error("Error deleting segment:", err);
        setError("Error deleting segment");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle moving a segment up
  const handleMoveSegmentUp = (index) => {
    if (index === 0) return; // Can't move the first segment up
    const newOrder = [...segmentOrder];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];
    saveUpdatedSegmentOrder(newOrder);
  };

  // Handle moving a segment down
  const handleMoveSegmentDown = (index) => {
    if (index === segmentOrder.length - 1) return; // Can't move the last segment down
    const newOrder = [...segmentOrder];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];
    saveUpdatedSegmentOrder(newOrder);
  };

  // Save the reordered segments order and reset the segment order
  const saveUpdatedSegmentOrder = (newOrder) => {
    setLoading(true);

    FeatureManagementAPI.reorderFeatureSegments(platform, feature.id, newOrder)
      .then(() => {
        refreshData(); // Refresh feature data, which includes updated segments
      })
      .catch((err) => {
        console.error("Error updating segment order:", err);
        setError("Error updating segment order");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="feature-item">
      <div className="feature-header" onClick={handleToggleExpand}>
        <span>
          {feature.description} (Type: {feature.type})
        </span>
        <span className="feature-info">
          <span className="feature-value">{feature.value.toString()}</span>
          {feature.rollout && (
            <span className="rollout-info">
              <input
                type="range"
                min="0"
                max="100"
                value={feature.rollout.percentage}
                readOnly
                className="rollout-slider"
              />
              <span>{feature.rollout.secondaryValue.toString()}</span>
            </span>
          )}
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="log-button"
          >
            Log
          </button>
          <button onClick={() => setIsEditing(true)} className="edit-button">
            Edit
          </button>
          <button onClick={handleDeleteFeature} className="delete-button">
            Delete
          </button>
        </span>
      </div>

      {isExpanded && (
        <div className="feature-content">
          <button
            onClick={() => handleOpenAddSegmentModal(null)} // Open modal for adding a new segment
            className="add-segment-button"
          >
            New Segment Override
          </button>
          <SegmentList
            segments={feature.segments}
            onEditSegment={handleOpenAddSegmentModal} // Pass index to edit segment
            onDeleteSegment={handleDeleteSegment}
            onMoveSegmentDown={handleMoveSegmentDown}
            onMoveSegmentUp={handleMoveSegmentUp}
          />
        </div>
      )}

      {isEditing && (
        <FeatureEditModal
          feature={feature}
          platform={platform}
          groupId={groupId}
          onClose={() => setIsEditing(false)}
          refreshData={refreshData}
        />
      )}

      {isAddSegmentModalOpen && (
        <AddSegmentModal
          segmentsData={segmentsData}
          featureType={feature.type}
          featureId={feature.id}
          platform={platform}
          onClose={() => setIsAddSegmentModalOpen(false)}
          refreshData={refreshData}
          existingSegment={
            editSegmentIndex !== null
              ? feature.segments[editSegmentIndex]
              : null
          } // Pass existing segment if editing
          isEditMode={editSegmentIndex !== null} // Indicate if in edit mode
        />
      )}

      {isLogModalOpen && (
        <LogModal
          platform={platform}
          groupId={groupId}
          featureId={feature.id} // Pass the feature ID for logs
          onClose={() => setIsLogModalOpen(false)}
        />
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default FeatureAccordion;
