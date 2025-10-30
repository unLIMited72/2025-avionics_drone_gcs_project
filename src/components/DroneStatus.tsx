import './DroneStatus.css';

export default function DroneStatus() {
  const activeDrones = 12;

  return (
    <div className="drone-status">
      <div className="drone-status-icon">
        <svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="32" cy="32" r="6" fill="currentColor" />
          <circle cx="16" cy="16" r="5" />
          <circle cx="48" cy="16" r="5" />
          <circle cx="16" cy="48" r="5" />
          <circle cx="48" cy="48" r="5" />
          <line x1="26" y1="26" x2="18" y2="18" />
          <line x1="38" y1="26" x2="46" y2="18" />
          <line x1="26" y1="38" x2="18" y2="46" />
          <line x1="38" y1="38" x2="46" y2="46" />
        </svg>
      </div>
      <div className="drone-status-display">
        <div className="drone-status-label">Drone Count</div>
        <div className="drone-status-count">{activeDrones}</div>
      </div>
    </div>
  );
}
