import { useState, useEffect } from 'react';
import './DroneSimulator.css';

interface Drone {
  drone_id: string;
  name: string;
  status: string;
  battery_level: number;
}

export default function DroneSimulator() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDrones = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drones`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch drones');
      const data = await response.json();
      setDrones(data);
    } catch (error) {
      console.error('Error fetching drones:', error);
    }
  };

  useEffect(() => {
    fetchDrones();
  }, []);

  const updateDroneStatus = async (droneId: string, newStatus: string) => {
    setLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drones/${droneId}`;
      console.log('[DroneSimulator] Updating drone:', droneId, 'to status:', newStatus);

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DroneSimulator] Update failed:', response.status, errorText);
        throw new Error('Failed to update drone');
      }

      const data = await response.json();
      console.log('[DroneSimulator] Drone updated successfully:', data);

      await fetchDrones();
      console.log('[DroneSimulator] Drone list refreshed');
    } catch (error) {
      console.error('[DroneSimulator] Error updating drone:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectAllDrones = async () => {
    setLoading(true);
    try {
      const disconnectedDrones = drones.filter(d => d.status === 'disconnected');
      for (const drone of disconnectedDrones) {
        await updateDroneStatus(drone.drone_id, 'connected');
      }
    } finally {
      setLoading(false);
    }
  };

  const disconnectAllDrones = async () => {
    setLoading(true);
    try {
      const connectedDrones = drones.filter(d => d.status === 'connected');
      for (const drone of connectedDrones) {
        await updateDroneStatus(drone.drone_id, 'disconnected');
      }
    } finally {
      setLoading(false);
    }
  };

  const connectedCount = drones.filter(d => d.status === 'connected').length;

  return (
    <div className="drone-simulator">
      <div className="simulator-header">
        <h3>Drone Simulator</h3>
        <div className="status-summary">
          {connectedCount} / {drones.length} Connected
        </div>
      </div>

      <div className="simulator-actions">
        <button
          className="sim-btn connect-all"
          onClick={connectAllDrones}
          disabled={loading}
        >
          Connect All
        </button>
        <button
          className="sim-btn disconnect-all"
          onClick={disconnectAllDrones}
          disabled={loading}
        >
          Disconnect All
        </button>
      </div>

      <div className="drone-list">
        {drones.slice(0, 5).map(drone => (
          <div key={drone.drone_id} className="drone-item">
            <div className="drone-info">
              <div className="drone-name">{drone.name}</div>
              <div className={`drone-status-badge status-${drone.status}`}>
                {drone.status}
              </div>
            </div>
            <button
              className="toggle-btn"
              onClick={() => updateDroneStatus(
                drone.drone_id,
                drone.status === 'connected' ? 'disconnected' : 'connected'
              )}
              disabled={loading}
            >
              {drone.status === 'connected' ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
