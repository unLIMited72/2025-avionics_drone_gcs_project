import './Dashboard.css';
import FlightStateBlock from './FlightStateBlock';
import DroneStarterBlock from './DroneStarterBlock';
import ControllerBlockButton from './ControllerBlockButton';
import WorkspaceLogBlock from './WorkspaceLogBlock';

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onDragStart?: (type: string) => void;
  onDragEnd?: () => void;
}

export default function Dashboard({ isOpen, onDragStart = () => {}, onDragEnd = () => {} }: DashboardProps) {
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
            <WorkspaceLogBlock onDragStart={onDragStart} onDragEnd={onDragEnd} />
          </div>
        </div>
      </div>
    </aside>
  );
}
