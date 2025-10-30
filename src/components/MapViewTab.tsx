import { useEffect, useRef } from 'react';
import './MapViewTab.css';

export default function MapViewTab() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const loadMap = () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.openstreetmap.org/export/embed.html?bbox=126.9%2C37.5%2C127.1%2C37.6&layer=mapnik';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.title = 'Mission Map';

      if (mapRef.current) {
        mapRef.current.innerHTML = '';
        mapRef.current.appendChild(iframe);
      }
    };

    loadMap();
  }, []);

  return (
    <div className="map-view-tab">
      <div className="map-container" ref={mapRef}>
        <div className="map-loading">Loading map...</div>
      </div>
    </div>
  );
}
