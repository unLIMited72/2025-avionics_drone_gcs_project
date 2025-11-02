import { useEffect, useRef, useState } from 'react';
import './MapView.css';

interface MapViewProps {
  serverStatus: 'connected' | 'disconnected' | 'connecting';
  onResetView: () => void;
  connectedDroneCount: number;
}

export default function MapView({ serverStatus, onResetView, connectedDroneCount }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWaypointMode, setIsWaypointMode] = useState(false);
  const [, setWaypoints] = useState<Array<{lat: number; lng: number; marker: any}>>([]);
  const [uploadMessage, setUploadMessage] = useState<{text: string; type: 'success' | 'error'} | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) {
      console.error('Leaflet not loaded');
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [37.7749, -122.4194],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      maxZoom: 18,
    }).addTo(map);

    const savedWaypoints = localStorage.getItem('map-waypoints');
    if (savedWaypoints) {
      const points = JSON.parse(savedWaypoints);
      const markers = points.map((point: {lat: number; lng: number}) => {
        const marker = L.marker([point.lat, point.lng]).addTo(map);
        return { lat: point.lat, lng: point.lng, marker };
      });
      setWaypoints(markers);
    }

    map.on('click', (e: any) => {
      if (!isWaypointMode) return;
      const marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
      setWaypoints(prev => {
        const newWaypoints = [...prev, { lat: e.latlng.lat, lng: e.latlng.lng, marker }];
        localStorage.setItem('map-waypoints', JSON.stringify(newWaypoints.map(w => ({ lat: w.lat, lng: w.lng }))));
        return newWaypoints;
      });
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isWaypointMode]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleWaypointToggle = () => {
    setIsWaypointMode(!isWaypointMode);
  };

  const handleClearWaypoints = () => {
    if (mapInstanceRef.current) {
      setWaypoints(prev => {
        prev.forEach(wp => {
          mapInstanceRef.current.removeLayer(wp.marker);
        });
        localStorage.removeItem('map-waypoints');
        return [];
      });
    }
    setIsSettingsOpen(false);
  };

  const handleUpload = () => {
    if (serverStatus !== 'connected') {
      setUploadMessage({ text: 'Server connection required', type: 'error' });
      setTimeout(() => setUploadMessage(null), 3000);
      return;
    }

    setUploadMessage({ text: 'Successfully uploaded to server', type: 'success' });
    setTimeout(() => setUploadMessage(null), 3000);
  };

  return (
    <div className="map-scope">
      <div ref={mapContainerRef} className="map-container" />

      <div className="map-clock-controls">
        <button
          className="map-settings-btn"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          title="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>

        {isSettingsOpen && (
          <div className="map-settings-panel">
            <button
              className={`map-settings-panel-btn ${isWaypointMode ? 'active' : ''}`}
              onClick={handleWaypointToggle}
              title="Toggle waypoint mode"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Waypoint</span>
            </button>
            <button
              className="map-settings-panel-btn clear"
              onClick={handleClearWaypoints}
              title="Clear all waypoints"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              <span>Clear</span>
            </button>
            <button
              className={`map-settings-panel-btn upload ${serverStatus !== 'connected' ? 'disabled' : ''}`}
              onClick={handleUpload}
              disabled={serverStatus !== 'connected'}
              title="Upload waypoints to server"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>Upload</span>
            </button>
          </div>
        )}

        <button
          className="map-reset-view-btn"
          onClick={onResetView}
          title="Reset view to default"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
        <div className="map-digital-clock">
          <div className="map-clock-display">
            <span className="map-time-segment">{currentTime.split(':')[0]}</span>
            <span className="map-time-separator">:</span>
            <span className="map-time-segment">{currentTime.split(':')[1]}</span>
            <span className="map-time-separator">:</span>
            <span className="map-time-segment">{currentTime.split(':')[2]}</span>
          </div>
        </div>
      </div>

      {uploadMessage && (
        <div className={`map-upload-message ${uploadMessage.type}`}>
          {uploadMessage.text}
        </div>
      )}

      <div className="map-drone-status">
        <div className="map-drone-status-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="map-drone-status-display">
          <div className="map-drone-status-label">CONNECTED</div>
          <div
            className="map-drone-status-count"
            style={{ color: connectedDroneCount === 0 ? 'rgba(0, 212, 255, 0.4)' : '#00d4ff' }}
          >
            {connectedDroneCount}
          </div>
        </div>
      </div>
    </div>
  );
}
