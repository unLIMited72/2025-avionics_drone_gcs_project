import { useState, useEffect } from 'react';
import Header, { type ServerStatus } from './components/Header';
import Dashboard from './components/Dashboard';
import Tabs from './components/Tabs';
import PlanView from './components/PlanView';
import MapViewTab from './components/MapViewTab';
import './App.css';

declare const __BUILD_HASH__: string;
const BUILD_HASH = __BUILD_HASH__;

function App() {
  const [serverStatus] = useState<ServerStatus>('disconnected');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'map'>('plan');

  useEffect(() => {
    console.log('[ROUTING] Active Plan Component: src/components/PlanView.tsx');
    console.log('[BUILD] Hash:', BUILD_HASH);
  }, []);

  useEffect(() => {
    console.log('[TAB SWITCH] Active tab:', activeTab);
  }, [activeTab]);

  return (
    <div className="gcs-app">
      <Header
        serverStatus={serverStatus}
        onLogoClick={() => setIsDashboardOpen(!isDashboardOpen)}
      />
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      <Dashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />

      <div className="plan-scope" style={{ display: activeTab === 'plan' ? 'block' : 'none' }}>
        <PlanView />
      </div>
      {activeTab === 'map' && <MapViewTab />}

      <div
        style={{
          position: 'fixed',
          bottom: '180px',
          right: '16px',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.3)',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          zIndex: 150,
          userSelect: 'none'
        }}
      >
        {BUILD_HASH}
      </div>
    </div>
  );
}

export default App;
