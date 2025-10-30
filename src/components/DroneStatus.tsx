import { useState, useEffect, useRef } from 'react';
import './DroneStatus.css';

interface DroneSummary {
  connectedCount: number;
  disconnectedCount: number;
  errorCount: number;
  totalCount: number;
}

export default function DroneStatus() {
  const [droneCount, setDroneCount] = useState<number | null>(null);
  const [serverConnected, setServerConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  const fetchDroneSummary = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drones/summary`;
      console.log('[DroneStatus] Fetching from:', apiUrl);

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
        throw new Error(`Failed to fetch drone summary: ${response.status}`);
      }

      const data: DroneSummary = await response.json();
      console.log('[DroneStatus] Received data:', data);
      console.log('[DroneStatus] Setting drone count to:', data.connectedCount);

      setDroneCount(data.connectedCount);
      setServerConnected(true);
      setIsLoading(false);
    } catch (error) {
      console.error('[DroneStatus] Error fetching drone summary:', error);
      setServerConnected(false);
      setIsLoading(false);
    }
  };

  const connectWebSocket = () => {
    try {
      const wsUrl = import.meta.env.VITE_SUPABASE_URL?.replace('https://', 'wss://').replace('http://', 'ws://');
      if (!wsUrl) return;

      const ws = new WebSocket(`${wsUrl}/functions/v1/drones/ws`);

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.connectedCount !== undefined) {
            setDroneCount(data.connectedCount);
            setServerConnected(true);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket closed, will rely on polling');
        wsRef.current = null;
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  };

  useEffect(() => {
    fetchDroneSummary();

    pollIntervalRef.current = window.setInterval(() => {
      fetchDroneSummary();
    }, 2000);

    connectWebSocket();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const getStatusClass = () => {
    if (!serverConnected) return 'status-disconnected';
    if (droneCount === null || droneCount === 0) return 'status-default';
    if (droneCount >= 1) return 'status-success';
    return 'status-default';
  };

  const displayCount = serverConnected ? (droneCount ?? 0) : '--';

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
