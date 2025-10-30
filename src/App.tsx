import { useState } from 'react';
import Header, { type ServerStatus } from './components/Header';
import Dashboard from './components/Dashboard';
import Tabs from './components/Tabs';
import PlanView from './components/PlanView';
import MapViewTab from './components/MapViewTab';
import './App.css';

function App() {
  const [serverStatus] = useState<ServerStatus>('disconnected');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'map'>('plan');

  return (
    <div className="gcs-app">
      <Header
        serverStatus={serverStatus}
        onLogoClick={() => setIsDashboardOpen(!isDashboardOpen)}
      />
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      <Dashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />

      <div style={{ display: activeTab === 'plan' ? 'block' : 'none' }}>
        <PlanView />
      </div>
      {activeTab === 'map' && <MapViewTab />}
    </div>
  );
}

export default App;
