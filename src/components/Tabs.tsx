import { memo } from 'react';
import './Tabs.css';

interface TabsProps {
  activeTab: 'plan' | 'map';
  onTabChange: (tab: 'plan' | 'map') => void;
}

function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="tabs-container">
      <button
        className={`tab-button ${activeTab === 'plan' ? 'active' : ''}`}
        onClick={() => onTabChange('plan')}
      >
        Plan
      </button>
      <button
        className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
        onClick={() => onTabChange('map')}
      >
        Map
      </button>
    </div>
  );
}

export default memo(Tabs);
