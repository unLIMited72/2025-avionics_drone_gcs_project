import './Dashboard.css';
import FlightStateBlock from './FlightStateBlock';
import DroneStarterBlock from './DroneStarterBlock';
import ControllerBlockButton from './ControllerBlockButton';
import SystemLogBlock from './SystemLogBlock';

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Dashboard({ isOpen }: DashboardProps) {
  return (
    <aside className={`dashboard-panel ${isOpen ? 'open' : ''}`}>
      <div className="dashboard-header">
        <h2 className="dashboard-title">Drone Function Block</h2>
      </div>
      <div className="dashboard-content">
        <div className="blocks-section">
          <div className="blocks-list">
            <DroneStarterBlock />
            <FlightStateBlock />
            <ControllerBlockButton />
            <SystemLogBlock />
          </div>
        </div>
      </div>
    </aside>
  );
}
