import React from 'react';
import { Header } from '../components/Header/Header';
import { PlatformSection } from '../components/PlatformSection/PlatformSection';
import { GroupsSection } from '../components/GroupsSection/GroupsSection';
import { ModalsContainer } from '../components/ModalsContainer/ModalsContainer';
import { useApp } from '../context/SimpleContext';
import { usePlatformData } from '../hooks';

export const FeatureManagementPage: React.FC = () => {
  const { state, actions } = useApp();
  const { platformData, loading, error, refetch } = usePlatformData(state.app.selectedPlatform);

  const groups = platformData?.groups || [];

  const handleRefetch = React.useCallback(async () => {
    await refetch();
    actions.restoreScrollPosition();
  }, [refetch, actions]);

  return (
    <div className="feature-management-page">
      <Header />

      <main className="main-content">
        <PlatformSection />

        {state.app.selectedPlatform ? (
          <div className="content-area">
            {loading ? (
              <div className="loading-message">
                <p>Loading feature groups...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>Error loading groups: {error}</p>
                <button onClick={handleRefetch}>Retry</button>
              </div>
            ) : (
              <GroupsSection groups={groups} onRefresh={handleRefetch} />
            )}
          </div>
        ) : (
          <div className="welcome-message">
            <p>Please select a platform to view and manage feature flags.</p>
          </div>
        )}
      </main>

      <ModalsContainer onRefresh={handleRefetch} />
    </div>
  );
};
