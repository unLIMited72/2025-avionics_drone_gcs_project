import './Dashboard.css';

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Dashboard({ isOpen }: DashboardProps) {
  const activeDrones = 12;

  return (
    <aside className={`dashboard-panel ${isOpen ? 'open' : ''}`}>
      <div className="dashboard-header">
        <h2 className="dashboard-title">Drone Function Block</h2>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect
                x="8"
                y="8"
                width="48"
                height="48"
                rx="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <h3 className="empty-title">Dashboard Empty</h3>
          <p className="empty-description">
            Dashboard widgets and controls will appear here.
          </p>
        </div>
      </div>
      <div className="drone-status-box">
        <div className="drone-icon">
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="32" cy="32" r="8" fill="currentColor" />
            <circle cx="16" cy="16" r="6" />
            <circle cx="48" cy="16" r="6" />
            <circle cx="16" cy="48" r="6" />
            <circle cx="48" cy="48" r="6" />
            <line x1="24" y1="24" x2="16" y2="16" />
            <line x1="40" y1="24" x2="48" y2="16" />
            <line x1="24" y1="40" x2="16" y2="48" />
            <line x1="40" y1="40" x2="48" y2="48" />
          </svg>
        </div>
        <div className="drone-status-content">
          <div className="drone-status-label">Active Drones</div>
          <div className="drone-status-count">{activeDrones}</div>
        </div>
      </div>
    </aside>
  );
}
