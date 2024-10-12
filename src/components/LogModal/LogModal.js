import React, { useEffect, useState } from "react";
import "./LogModal.css"; // Optional: Add styles for the modal
import { staticBaseUrl } from "../../config";

const LogModal = ({ platform, groupId, featureId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Construct the URL for the logs
  const logUrl = featureId
    ? `${staticBaseUrl}/logs/${platform}/${groupId}/${featureId}.json`
    : `${staticBaseUrl}/logs/${platform}/${groupId}.json`;

  useEffect(() => {
    // Fetch logs when the modal is opened
    fetch(logUrl)
      .then((response) => response.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching logs:", err);
        setError("Failed to load logs.");
        setLoading(false);
      });
  }, [logUrl]);

  return (
    <div className="log-modal">
      <div className="log-modal-content">
        <h2>Logs</h2>
        <button className="close-button" onClick={onClose}>
          X
        </button>

        {loading && <p>Loading logs...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <div className="log-list">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="log-item">
                  <p>
                    <strong>User:</strong> {log.user}
                  </p>
                  <p>
                    <strong>Action:</strong> {log.action}
                  </p>
                  <p>
                    <strong>Timestamp:</strong>{" "}
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                  {log.segment && (
                    <p>
                      <strong>Segment:</strong> {JSON.stringify(log.segment)}
                    </p>
                  )}
                  {log.value !== undefined && (
                    <p>
                      <strong>Value:</strong> {log.value.toString()}
                    </p>
                  )}
                  {log.rollout && (
                    <p>
                      <strong>Rollout:</strong> {JSON.stringify(log.rollout)}
                    </p>
                  )}
                  <hr />
                </div>
              ))
            ) : (
              <p>No logs found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogModal;
