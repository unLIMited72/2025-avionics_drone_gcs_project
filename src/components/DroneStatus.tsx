import { useState, useEffect } from 'react';
import './DroneStatus.css';

const DISCONNECTED_COLOR = '#00d4ff';
const CONNECTED_COLOR = '#00ff96';

export default function DroneStatus() {
  const [droneCount, setDroneCount] = useState(0);

  useEffect(() => {
    setDroneCount(0);

    const fetchDroneCount = async () => {
      try {
        const response = await fetch('/api/drones?status=connected');
        if (response.ok) {
          const drones = await response.json();
          const count = Array.isArray(drones) ? drones.length : 0;
          setDroneCount(count);
        } else {
          setDroneCount(0);
        }
      } catch (error) {
        console.error('Failed to fetch drone count:', error);
        setDroneCount(0);
      }
    };

    fetchDroneCount();

    const interval = setInterval(fetchDroneCount, 5000);

    return () => clearInterval(interval);
  }, []);

  const statusColor = droneCount === 0 ? DISCONNECTED_COLOR : CONNECTED_COLOR;

  return (
    <div className="drone-status">
      <div className="drone-status-icon" style={{
        borderColor: statusColor,
        background: `linear-gradient(135deg, ${statusColor}20 0%, ${statusColor}10 100%)`,
        boxShadow: `0 2px 8px ${statusColor}30, inset 0 0 15px ${statusColor}10`
      }}>
        <svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke={statusColor} strokeWidth="2.5">
          <circle cx="32" cy="32" r="6" fill={statusColor} />
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
        <div className="drone-status-count" style={{
          color: statusColor,
          textShadow: `0 0 8px ${statusColor}80`
        }}>
          {droneCount}
        </div>
      </div>
    </div>
  );
}
