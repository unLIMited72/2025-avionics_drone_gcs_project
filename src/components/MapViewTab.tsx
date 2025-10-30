import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapViewTab.css';

export default function MapViewTab() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
      setIsLoading(false);
      return;
    }

    try {
      const map = L.map(mapRef.current, {
        center: [37.5665, 126.9780],
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
        minZoom: 3,
      }).addTo(map);

      map.on('load', () => {
        setIsLoading(false);
        setError(null);
      });

      map.on('tileerror', (e) => {
        console.error('Tile load error:', e);
        setError('Failed to load map tiles. Check network connection.');
      });

      setTimeout(() => {
        map.invalidateSize();
        setIsLoading(false);
      }, 100);

      mapInstanceRef.current = map;

    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map. Please refresh.');
      setIsLoading(false);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    window.location.reload();
  };

  return (
    <div className="map-view-tab">
      {isLoading && (
        <div className="map-loading-overlay">
          <div className="map-loading-spinner"></div>
          <div className="map-loading-text">Loading map...</div>
        </div>
      )}

      {error && (
        <div className="map-error-banner">
          <div className="map-error-message">{error}</div>
          <button className="map-error-retry" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      <div ref={mapRef} className="map-container" />
    </div>
  );
}
