import { useState, useRef, useEffect, type MouseEvent } from 'react';
import './WorkspaceDroneStarter.css';

interface WorkspaceDroneStarterProps {
  id: string;
  initialX: number;
  initialY: number;
  zoom: number;
  onRemove: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}


export default function WorkspaceDroneStarter({
  id,
  initialX,
  initialY,
  zoom,
  onRemove,
  onPositionChange
}: WorkspaceDroneStarterProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const blockRef = useRef<HTMLDivElement>(null);

  const [serialNumber, setSerialNumber] = useState('');
  const [droneName, setDroneName] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  const handleMouseDown = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('input, button')) {
      return;
    }

    if (blockRef.current) {
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
      setIsDragging(true);
    }
    e.stopPropagation();
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      if (isDragging) {
        const deltaX = (e.clientX - dragStart.x) / zoom;
        const deltaY = (e.clientY - dragStart.y) / zoom;

        const newX = position.x + deltaX;
        const newY = position.y + deltaY;

        setPosition({ x: newX, y: newY });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        onPositionChange(id, position.x, position.y);
      }
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
  }, [isDragging, dragStart, position, zoom, id, onPositionChange]);

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation();
    onRemove(id);
  };

  const handleConnect = () => {
    if (serialNumber.trim() && droneName.trim()) {
      setIsConnected(true);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  return (
    <div
      ref={blockRef}
      className={`workspace-drone-starter ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="workspace-block-header">
        <div className="workspace-block-title">
          {isConnected ? (
            <>
              <span className="drone-name">{droneName}</span>
              <span className="drone-serial">#{serialNumber}</span>
            </>
          ) : (
            'Drone Starter'
          )}
        </div>
        <button className="workspace-block-remove" onClick={handleRemove}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="drone-starter-body">
        <div className="connection-section">
          <div className="input-wrapper">
            <input
              type="text"
              className="drone-input"
              placeholder="Serial Number"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              disabled={isConnected}
            />
            <input
              type="text"
              className="drone-input"
              placeholder="Drone Name"
              value={droneName}
              onChange={(e) => setDroneName(e.target.value)}
              disabled={isConnected}
            />
          </div>
          {!isConnected ? (
            <button
              className="connect-btn"
              onClick={handleConnect}
              disabled={!serialNumber.trim() || !droneName.trim()}
            >
              Connect
            </button>
          ) : (
            <button className="disconnect-btn" onClick={handleDisconnect}>
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
