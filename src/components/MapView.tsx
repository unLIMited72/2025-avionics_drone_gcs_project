import { useEffect, useRef } from 'react';
import './MapView.css';

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  }, []);

  return (
    <div className="map-scope">
      <div ref={mapContainerRef} className="map-container" />
    </div>
  );
}
