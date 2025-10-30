import { useState, useEffect } from 'react';
import './DroneStatus.css';

export default function DroneStatus() {
  const [activeDrones, setActiveDrones] = useState(0);

  useEffect(() => {
    setActiveDrones(0);
  }, []);

  return (
    <div className="drone-status">
      <div
        className="drone-status-icon"
        style={{
          borderColor: activeDrones > 0 ? 'rgba(0, 255, 150, 0.4)' : 'rgba(0, 212, 255, 0.4)',
          background: activeDrones > 0
            ? 'linear-gradient(135deg, rgba(0, 255, 150, 0.2) 0%, rgba(0, 200, 100, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 150, 255, 0.1) 100%)'
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ color: activeDrones > 0 ? '#00ff96' : '#00d4ff' }}
        >
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
            color: activeDrones > 0 ? '#00ff96' : '#00d4ff',
            textShadow: activeDrones > 0
              ? '0 0 8px rgba(0, 255, 150, 0.5)'
              : '0 0 8px rgba(0, 212, 255, 0.5)'
          }}
        >
          {activeDrones}
        </div>
      </div>
    </div>
  );
}
