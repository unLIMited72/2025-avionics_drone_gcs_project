import { useState, useEffect, useRef } from 'react';
import './DroneStatus.css';

interface Drone {
  id: string;
  drone_id: string;
  name: string;
  status: string;
}

export default function DroneStatus() {
  const [droneCount, setDroneCount] = useState<number>(0);
  const [, setDroneIds] = useState<string[]>([]);
  const [serverConnected, setServerConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pollIntervalRef = useRef<number | null>(null);

  const updateDroneCount = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drones?status=connected`;
      console.log('[DroneStatus] Fetching connected drones from:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[DroneStatus] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DroneStatus] API Error:', response.status, errorText);
        throw new Error(`Failed to fetch drones: ${response.status}`);
      }

      const data = await response.json();
      console.log('[DroneStatus] count_payload:', data);

      const list: Drone[] = Array.isArray(data) ? data : [];
      const ids = list.map(d => d.id || d.drone_id).filter(Boolean);
      const uniqueIds = [...new Set(ids)];
      const count = uniqueIds.length;

      console.log('[DroneStatus] Parsed list:', list);
      console.log('[DroneStatus] Extracted IDs:', ids);
      console.log('[DroneStatus] Unique IDs (REPLACE):', uniqueIds);
      console.log('[DroneStatus] Computed count (REPLACE):', count);

      setDroneCount(count);
      setDroneIds(uniqueIds);
      console.log('[DroneStatus] state.droneCount:', count);
      console.log('[DroneStatus] state.droneIds:', uniqueIds);
      setServerConnected(true);
      setIsLoading(false);
    } catch (error) {
      console.error('[DroneStatus] Error fetching drones:', error);
      setDroneCount(0);
      setDroneIds([]);
      setServerConnected(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('[DroneStatus] Component mounted - initializing to 0');
    setDroneCount(0);
    setDroneIds([]);

    updateDroneCount();

    pollIntervalRef.current = window.setInterval(() => {
      updateDroneCount();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const getStatusClass = () => {
    if (!serverConnected) return 'status-disconnected';
    if (droneCount === 0) return 'status-default';
    if (droneCount >= 1) return 'status-success';
    return 'status-default';
  };

  const displayCount = serverConnected ? String(Number(droneCount ?? 0)) : '--';

  return (
    <div className={`drone-status ${getStatusClass()}`}>
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
        {isLoading && (
          <div className="status-loading-indicator"></div>
        )}
      </div>
      <div className="drone-status-display">
        <div className="drone-status-label">Drone Count</div>
        <div className="drone-status-count">{displayCount}</div>
      </div>
    </div>
  );
}
