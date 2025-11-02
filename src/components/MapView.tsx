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

  const handleUpload = () => {
    if (serverStatus !== 'connected') {
      setUploadMessage({ text: '서버 연결이 필요합니다', type: 'error' });
      setTimeout(() => setUploadMessage(null), 3000);
      return;
    }

    setUploadMessage({ text: '서버에 전송이 완료되었습니다', type: 'success' });
    setTimeout(() => setUploadMessage(null), 3000);
  };

  return (
    <div className="map-scope">
      <div ref={mapContainerRef} className="map-container" />

      <button
        className="map-settings-button"
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
      >
        ⚙️
      </button>

      {isSettingsOpen && (
        <div className="map-settings-panel">
          <button
            className={`map-settings-option ${isWaypointMode ? 'active' : ''}`}
            onClick={handleWaypointToggle}
          >
            {isWaypointMode ? '✓ ' : ''}웨이포인트 모드
          </button>
          <button
            className="map-settings-option upload"
            onClick={handleUpload}
          >
            업로드
          </button>
        </div>
      )}

      {uploadMessage && (
        <div className={`map-upload-message ${uploadMessage.type}`}>
          {uploadMessage.text}
        </div>
      )}

      <button
        className="map-reset-button"
        onClick={onResetView}
      >
        Reset View
      </button>

      <div className="map-digital-clock">
        {currentTime}
      </div>

      <div className="map-drone-status">
        <div className="map-drone-count">{connectedDroneCount}</div>
        <div className="map-drone-label">DRONES</div>
      </div>
    </div>
  );
}
