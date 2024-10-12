import React, { useState } from "react";
import "./AddGroupModal.css";

const AddGroupModal = ({ onClose, onCreate }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [error, setError] = useState("");

  const handleCreate = () => {
    // Validate input
    if (!groupName || !groupDescription) {
      setError("Both group name and description are required.");
      return;
    }

    // Call onCreate callback with group data
    const newGroup = {
      id: groupName,
      description: groupDescription,
    };
    onCreate(newGroup);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Group Description"
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button onClick={handleCreate}>Create Group</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupModal;
