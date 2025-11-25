import React, { useState, useEffect } from 'react';
import { Modal } from '../../shared/Modal/Modal';
import { ActionButton } from '../../shared/ActionButton/ActionButton';
import { Feature } from '../../../../shared/types';
import './LogModal.css';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: Feature;
  platform: string;
  groupName: string;
}

interface LogEntry {
  timestamp: string;
  action: string;
  user?: string;
  value?: any;
  segment?: Record<string, string[]> | null;
  rollout?: {
    percentage: number;
    secondaryValue: any;
  } | null;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
}

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  feature,
  platform,
  groupName,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && feature) {
      fetchLogs();
    }
  }, [isOpen, feature, platform, groupName]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const logPath = `logs/${platform}/${groupName}/${feature.id}.json`;

      const staticBaseUrl = process.env.REACT_APP_STATIC_BASE_URL;
      const s3LogUrl = `${staticBaseUrl}/${logPath}`;

      const response = await fetch(s3LogUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 404) {
          setLogs([]);
          return;
        }
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      const logData = await response.json();
      setLogs(Array.isArray(logData) ? logData : logData.logs || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return '#22c55e';
      case 'update':
      case 'updated':
        return '#3b82f6';
      case 'delete':
      case 'deleted':
        return '#ef4444';
      case 'toggle':
      case 'toggled':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Logs for ${feature.description} (${feature.id})`}
    >
      <div className="log-modal-content">
        <div className="log-modal-header">
          <ActionButton variant="secondary" onClick={fetchLogs} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </ActionButton>
        </div>

        {loading && (
          <div className="log-loading">
            <div className="loading-spinner"></div>
            <p>Loading logs...</p>
          </div>
        )}

        {error && (
          <div className="log-error">
            <p>Error: {error}</p>
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="log-empty">
            <p>No logs found for this feature.</p>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="log-entries">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                <div className="log-entry-header">
                  <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                  <span className="log-action" style={{ color: getActionColor(log.action) }}>
                    {log.action.replace(/-/g, ' ')}
                  </span>
                  {log.user && <span className="log-user">by {log.user}</span>}
                </div>

                {log.action === 'create-feature' && (
                  <div className="log-changes">
                    <div className="log-creation">
                      <strong>Feature created</strong>
                    </div>
                  </div>
                )}

                {log.action === 'change-feature-value' && (
                  <div className="log-changes">
                    {log.value !== undefined && (
                      <div className="log-value-change">
                        <strong>Value changed to:</strong>
                        <pre>{formatValue(log.value)}</pre>
                      </div>
                    )}

                    {log.segment && (
                      <div className="log-segment">
                        <strong>Segment:</strong>
                        <pre>{JSON.stringify(log.segment, null, 2)}</pre>
                      </div>
                    )}

                    {log.rollout && (
                      <div className="log-rollout">
                        <strong>Rollout:</strong>
                        <pre>{JSON.stringify(log.rollout, null, 2)}</pre>
                      </div>
                    )}

                    {log.segment === null && (
                      <div className="log-scope">
                        <strong>Scope:</strong> Default value (no segment)
                      </div>
                    )}
                  </div>
                )}

                {log.action !== 'create-feature' &&
                  log.action !== 'change-feature-value' &&
                  (log.oldValue !== undefined || log.newValue !== undefined) && (
                    <div className="log-changes">
                      {log.oldValue !== undefined && (
                        <div className="log-old-value">
                          <strong>From:</strong>
                          <pre>{formatValue(log.oldValue)}</pre>
                        </div>
                      )}
                      {log.newValue !== undefined && (
                        <div className="log-new-value">
                          <strong>To:</strong>
                          <pre>{formatValue(log.newValue)}</pre>
                        </div>
                      )}
                    </div>
                  )}

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="log-metadata">
                    <strong>Additional Info:</strong>
                    <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="modal-actions">
        <ActionButton variant="secondary" onClick={onClose}>
          Close
        </ActionButton>
      </div>
    </Modal>
  );
};
