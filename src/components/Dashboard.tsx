import './Dashboard.css';

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
    </aside>
  );
}
