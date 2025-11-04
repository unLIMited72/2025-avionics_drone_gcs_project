import { useState, useRef, useEffect } from 'react';
import './MapView.css';

interface MapViewProps {
  dronePosition: { lat: number; lon: number };
  altitude: number;
}

export default function MapView({ dronePosition, altitude }: MapViewProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => Math.min(Math.max(0.5, prevZoom * delta), 3));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart]);

  useEffect(() => {
    const mapElement = mapRef.current;
    if (mapElement) {
      mapElement.style.cursor = isDragging ? 'grabbing' : 'grab';
    }
  }, [isDragging]);

  return (
    <div className="map-view">
      <div className="map-header">
        <h2>Map View</h2>
        <div className="zoom-controls">
          <button
            className="zoom-btn"
            onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
            aria-label="Zoom in"
          >
            +
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button
            className="zoom-btn"
            onClick={() => setZoom(prev => Math.max(0.5, prev / 1.2))}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            className="reset-btn"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            aria-label="Reset view"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="map-container">
        <div
          ref={mapRef}
          className="map-placeholder"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center'
          }}
        >
          <div className="drone-marker" style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#00d4ff" strokeWidth="2" fill="rgba(0, 212, 255, 0.2)"/>
              <path d="M16 8 L20 16 L16 14 L12 16 Z" fill="#00d4ff"/>
            </svg>
          </div>
          <div className="coordinate-display">
            <div className="coord-item">
              <span className="coord-label">LAT</span>
              <span className="coord-value">{dronePosition.lat.toFixed(6)}</span>
            </div>
            <div className="coord-item">
              <span className="coord-label">LON</span>
              <span className="coord-value">{dronePosition.lon.toFixed(6)}</span>
            </div>
            <div className="coord-item">
              <span className="coord-label">ALT</span>
              <span className="coord-value">{altitude.toFixed(1)} m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
