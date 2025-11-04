import './Dashboard.css';
import FlightStateBlock from './FlightStateBlock';
import DroneStarterBlock from './DroneStarterBlock';
import ControllerBlockButton from './ControllerBlockButton';
import LogBlock from './LogBlock';
import DronePackBlock from './DronePackBlock';

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
            <DronePackBlock />
            <DroneStarterBlock />
            <FlightStateBlock />
            <ControllerBlockButton />
            <LogBlock />
          </div>
        </div>
      </div>
    </aside>
  );
}
