import { useState, useRef, useEffect } from 'react';
import './MapView.css';

interface MapViewProps {
  dronePosition: { lat: number; lon: number };
  altitude: number;
}

interface Waypoint {
  id: string;
  x: number;
  y: number;
  lat: number;
  lon: number;
}

export default function MapView({ dronePosition, altitude }: MapViewProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
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

  const handleMapClick = (e: React.MouseEvent) => {
    if (isDragging) return;

    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left - rect.width / 2;
    const clickY = e.clientY - rect.top - rect.height / 2;

    const adjustedX = (clickX - pan.x) / zoom;
    const adjustedY = (clickY - pan.y) / zoom;

    const latOffset = adjustedY * 0.00001;
    const lonOffset = adjustedX * 0.00001;

    const newWaypoint: Waypoint = {
      id: `wp-${Date.now()}`,
      x: adjustedX,
      y: adjustedY,
      lat: dronePosition.lat + latOffset,
      lon: dronePosition.lon + lonOffset
    };

    setWaypoints(prev => [...prev, newWaypoint]);
  };

  const handleRemoveWaypoint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWaypoints(prev => prev.filter(wp => wp.id !== id));
  };

  const handleClearAllWaypoints = () => {
    setWaypoints([]);
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
          {waypoints.length > 0 && (
            <button
              className="clear-waypoints-btn"
              onClick={handleClearAllWaypoints}
              aria-label="Clear all waypoints"
            >
              Clear WPs ({waypoints.length})
            </button>
          )}
        </div>
      </div>
      <div className="map-container">
        <div
          ref={mapRef}
          className="map-placeholder"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onClick={handleMapClick}
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

          {waypoints.map((wp, index) => (
            <div
              key={wp.id}
              className="waypoint-marker"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${wp.x}px), calc(-50% + ${wp.y}px))`
              }}
              onClick={(e) => handleRemoveWaypoint(wp.id, e)}
            >
              <div className="waypoint-number">{index + 1}</div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#ff6b6b" strokeWidth="2" fill="rgba(255, 107, 107, 0.3)"/>
                <circle cx="12" cy="12" r="4" fill="#ff6b6b"/>
              </svg>
              <div className="waypoint-coords">
                <span>{wp.lat.toFixed(6)}, {wp.lon.toFixed(6)}</span>
              </div>
            </div>
          ))}

          {waypoints.length > 1 && (
            <svg className="waypoint-path" style={{ pointerEvents: 'none' }}>
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#ff6b6b" />
                </marker>
              </defs>
              {waypoints.map((wp, index) => {
                if (index === 0) return null;
                const prevWp = waypoints[index - 1];
                return (
                  <line
                    key={`path-${wp.id}`}
                    x1="50%"
                    y1="50%"
                    x2="50%"
                    y2="50%"
                    style={{
                      transform: `translate(${prevWp.x}px, ${prevWp.y}px)`,
                      transformOrigin: 'left top'
                    }}
                    stroke="#ff6b6b"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
            </svg>
          )}

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
            <div className="coord-item">
              <span className="coord-label">WP</span>
              <span className="coord-value">{waypoints.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
