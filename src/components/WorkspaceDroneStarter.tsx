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

type ArmState = 'armed' | 'disarmed';
type FlightMode = 'stabilize' | 'guided' | 'loiter' | 'rtl' | 'auto';
type HeartbeatState = 'connected' | 'disconnected';

const FLIGHT_MODES: FlightMode[] = ['stabilize', 'guided', 'loiter', 'rtl', 'auto'];

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
  const [heartbeat, setHeartbeat] = useState<HeartbeatState>('disconnected');
  const [armState, setArmState] = useState<ArmState>('disarmed');
  const [flightMode, setFlightMode] = useState<FlightMode>('stabilize');
  const [showModeMenu, setShowModeMenu] = useState(false);

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  const handleMouseDown = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('input, button, .mode-selector')) {
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
      setHeartbeat('connected');
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setHeartbeat('disconnected');
    setArmState('disarmed');
  };

  const handleArm = () => {
    if (isConnected && armState === 'disarmed') {
      setArmState('armed');
    }
  };

  const handleDisarm = () => {
    if (isConnected && armState === 'armed') {
      setArmState('disarmed');
    }
  };

  const handleModeChange = (mode: FlightMode) => {
    if (isConnected) {
      setFlightMode(mode);
      setShowModeMenu(false);
    }
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

        <div className="status-section">
          <div className="status-row">
            <span className="status-label">Heartbeat:</span>
            <span className={`status-value heartbeat-${heartbeat}`}>{heartbeat}</span>
          </div>

          <div className="status-row">
            <span className="status-label">Arm State:</span>
            <span className={`status-value arm-${armState}`}>{armState}</span>
          </div>
        </div>

        <div className="control-section">
          <div className="arm-controls">
            <button
              className={`arm-btn ${armState === 'armed' ? 'active' : ''}`}
              onClick={handleArm}
              disabled={!isConnected || armState === 'armed'}
            >
              ARM
            </button>
            <button
              className={`disarm-btn ${armState === 'disarmed' ? 'active' : ''}`}
              onClick={handleDisarm}
              disabled={!isConnected || armState === 'disarmed'}
            >
              DISARM
            </button>
          </div>

          <div className="mode-section">
            <span className="mode-label">Flight Mode:</span>
            <div className="mode-selector">
              <button
                className="mode-display"
                onClick={() => setShowModeMenu(!showModeMenu)}
                disabled={!isConnected}
              >
                <span className={`mode-indicator mode-${flightMode}`}></span>
                <span className="mode-text">{flightMode.toUpperCase()}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {showModeMenu && isConnected && (
                <div className="mode-menu">
                  {FLIGHT_MODES.map((mode) => (
                    <button
                      key={mode}
                      className={`mode-option ${flightMode === mode ? 'selected' : ''}`}
                      onClick={() => handleModeChange(mode)}
                    >
                      <span className={`mode-indicator mode-${mode}`}></span>
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
