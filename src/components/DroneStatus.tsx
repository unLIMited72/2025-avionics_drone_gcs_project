import './DroneStatus.css';

interface DroneStatusProps {
  connectedDroneCount: number;
}

export default function DroneStatus({ connectedDroneCount }: DroneStatusProps) {
  const countColor = connectedDroneCount > 0 ? '#00A84F' : 'rgba(0, 212, 255, 0.4)';
  const iconColor = connectedDroneCount > 0 ? '#00A84F' : '#00d4ff';
  const glowColor = connectedDroneCount > 0 ? 'rgba(0, 168, 79, 0.5)' : 'rgba(0, 212, 255, 0.5)';
  const iconBgColor = connectedDroneCount > 0
    ? 'linear-gradient(135deg, rgba(0, 168, 79, 0.2) 0%, rgba(0, 140, 60, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 150, 255, 0.1) 100%)';
  const iconBorderColor = connectedDroneCount > 0 ? 'rgba(0, 168, 79, 0.4)' : 'rgba(0, 212, 255, 0.4)';
  const iconBoxShadow = connectedDroneCount > 0
    ? '0 2px 8px rgba(0, 168, 79, 0.2), inset 0 0 15px rgba(0, 168, 79, 0.1)'
    : '0 2px 8px rgba(0, 212, 255, 0.2), inset 0 0 15px rgba(0, 212, 255, 0.1)';

  return (
    <div className="drone-status">
      <div
        className="drone-status-icon"
        style={{
          background: iconBgColor,
          borderColor: iconBorderColor,
          boxShadow: iconBoxShadow,
          color: iconColor
        }}
      >
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
        <div
          className="drone-status-count"
          style={{
            color: countColor,
            textShadow: `0 0 8px ${glowColor}`
          }}
        >
          {connectedDroneCount}
        </div>
      </div>
    </div>
  );
}
