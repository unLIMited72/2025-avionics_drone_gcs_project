import { useState, useRef, useEffect, type MouseEvent } from 'react';
import './WorkspaceBlock.css';

interface WorkspaceBlockProps {
  id: string;
  type: string;
  initialX: number;
  initialY: number;
  zoom: number;
  pan: { x: number; y: number };
  onRemove: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

export default function WorkspaceBlock({
  id,
  initialX,
  initialY,
  zoom,
  onRemove,
  onPositionChange
}: WorkspaceBlockProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  const handleMouseDown = (e: MouseEvent) => {
    if (blockRef.current) {
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
      setIsDragging(true);
    }
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      const newX = position.x + deltaX;
      const newY = position.y + deltaY;

      setPosition({ x: newX, y: newY });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      onPositionChange(id, position.x, position.y);
    }
    setIsDragging(false);
  };

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation();
    onRemove(id);
  };

  return (
    <div
      ref={blockRef}
      className={`workspace-block ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="workspace-block-header">
        <div className="workspace-block-title">Flight State Information</div>
        <button className="workspace-block-remove" onClick={handleRemove}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="workspace-block-body">
        <div className="attitude-indicator">
          <div className="horizon">
            <div className="sky"></div>
            <div className="ground"></div>
            <div className="horizon-line"></div>
            <div className="aircraft-symbol">
              <div className="aircraft-line left"></div>
              <div className="aircraft-center"></div>
              <div className="aircraft-line right"></div>
            </div>
          </div>
        </div>

        <div className="flight-data-grid">
          <div className="data-item">
            <div className="data-label">Latitude</div>
            <div className="data-value">37.7749°</div>
          </div>
          <div className="data-item">
            <div className="data-label">Longitude</div>
            <div className="data-value">-122.4194°</div>
          </div>
          <div className="data-item">
            <div className="data-label">Altitude</div>
            <div className="data-value">120.5 m</div>
          </div>
          <div className="data-item">
            <div className="data-label">Velocity</div>
            <div className="data-value">15.2 m/s</div>
          </div>
          <div className="data-item">
            <div className="data-label">Acceleration</div>
            <div className="data-value">2.3 m/s²</div>
          </div>
        </div>

        <div className="flight-status">
          <div className="status-item">
            <div className="status-label">Mode</div>
            <div className="status-value mode">Mission</div>
          </div>
          <div className="status-item">
            <div className="status-label">Status</div>
            <div className="status-value armed">ARMED</div>
          </div>
        </div>
      </div>
    </div>
  );
}
