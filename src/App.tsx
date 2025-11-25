import React from 'react';
import { AppProvider } from './presentation/context/SimpleContext';
import { FeatureManagementPage } from './presentation/pages/SimplePage';
import './App.css';

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="App">
        <FeatureManagementPage />
      </div>
    </AppProvider>
  );
};

export default App;
