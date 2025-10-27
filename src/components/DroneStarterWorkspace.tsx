import { useState, useEffect, type ChangeEvent, type MouseEvent } from 'react';
import './DroneStarterWorkspace.css';

interface DroneStarterWorkspaceProps {
  id: string;
  initialX: number;
  initialY: number;
  zoom: number;
  onRemove: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

type DroneMode = 'MANUAL' | 'STABILIZE' | 'GUIDED' | 'AUTO';

export default function DroneStarterWorkspace({
  id,
  initialX,
  initialY,
  zoom,
  onRemove,
  onPositionChange
}: DroneStarterWorkspaceProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [serialCode, setSerialCode] = useState('');
  const [droneName, setDroneName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [heartbeat, setHeartbeat] = useState<'active' | 'inactive'>('inactive');
  const [isArmed, setIsArmed] = useState(false);
  const [droneMode, setDroneMode] = useState<DroneMode>('STABILIZE');
  const [showModeMenu, setShowModeMenu] = useState(false);

  const handleSerialCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSerialCode(e.target.value);
  };

  const handleDroneNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDroneName(e.target.value);
  };

  const handleConnect = () => {
    if (serialCode && droneName) {
      setIsConnected(true);
      setHeartbeat('active');
      console.log('Connecting to drone:', { serialCode, droneName });
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setHeartbeat('inactive');
    setIsArmed(false);
    console.log('Disconnected from drone');
  };

  const handleArm = () => {
    if (isConnected) {
      setIsArmed(true);
      console.log('Drone armed');
    }
  };

  const handleDisarm = () => {
    if (isConnected) {
      setIsArmed(false);
      console.log('Drone disarmed');
    }
  };

  const handleModeChange = (mode: DroneMode) => {
    if (isConnected) {
      setDroneMode(mode);
      setShowModeMenu(false);
      console.log('Mode changed to:', mode);
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drone-starter-input, .drone-starter-button, .mode-menu')) {
      return;
    }
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
    setIsDragging(true);
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

  return (
    <div
      className={`drone-starter-workspace ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="drone-starter-workspace-header">
        <div className="drone-starter-workspace-title">Drone Starter</div>
        <button className="drone-starter-workspace-remove" onClick={handleRemove}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="drone-starter-workspace-body">
        <div className="connection-section">
          <div className="input-group">
            <label className="input-label">Serial Code</label>
            <input
              type="text"
              className="drone-starter-input"
              value={serialCode}
              onChange={handleSerialCodeChange}
              placeholder="Enter serial code"
              disabled={isConnected}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Drone Name</label>
            <input
              type="text"
              className="drone-starter-input"
              value={droneName}
              onChange={handleDroneNameChange}
              placeholder="Enter drone name"
              disabled={isConnected}
            />
          </div>

          {!isConnected ? (
            <button
              className="drone-starter-button connect-button"
              onClick={handleConnect}
              disabled={!serialCode || !droneName}
            >
              Connect
            </button>
          ) : (
            <button
              className="drone-starter-button disconnect-button"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          )}
        </div>

        <div className="status-section">
          <div className="status-row">
            <div className="status-label">Heartbeat</div>
            <div className={`status-indicator ${heartbeat}`}>
              <div className="indicator-dot"></div>
              <span className="indicator-text">{heartbeat === 'active' ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          <div className="status-row">
            <div className="status-label">Arm Status</div>
            <div className={`status-indicator ${isArmed ? 'armed' : 'disarmed'}`}>
              <div className="indicator-dot"></div>
              <span className="indicator-text">{isArmed ? 'Armed' : 'Disarmed'}</span>
            </div>
          </div>

          <div className="control-buttons">
            <button
              className="drone-starter-button arm-button"
              onClick={handleArm}
              disabled={!isConnected || isArmed}
            >
              Arm
            </button>
            <button
              className="drone-starter-button disarm-button"
              onClick={handleDisarm}
              disabled={!isConnected || !isArmed}
            >
              Disarm
            </button>
          </div>
        </div>

        <div className="mode-section">
          <div className="status-row">
            <div className="status-label">Flight Mode</div>
            <div className={`mode-indicator mode-${droneMode.toLowerCase()}`}>
              <div className="indicator-dot"></div>
              <span className="indicator-text">{droneMode}</span>
            </div>
          </div>

          <div className="mode-control">
            <button
              className="drone-starter-button mode-button"
              onClick={() => setShowModeMenu(!showModeMenu)}
              disabled={!isConnected}
            >
              Change Mode
            </button>

            {showModeMenu && (
              <div className="mode-menu">
                <button
                  className={`mode-option ${droneMode === 'MANUAL' ? 'active' : ''}`}
                  onClick={() => handleModeChange('MANUAL')}
                >
                  MANUAL
                </button>
                <button
                  className={`mode-option ${droneMode === 'STABILIZE' ? 'active' : ''}`}
                  onClick={() => handleModeChange('STABILIZE')}
                >
                  STABILIZE
                </button>
                <button
                  className={`mode-option ${droneMode === 'GUIDED' ? 'active' : ''}`}
                  onClick={() => handleModeChange('GUIDED')}
                >
                  GUIDED
                </button>
                <button
                  className={`mode-option ${droneMode === 'AUTO' ? 'active' : ''}`}
                  onClick={() => handleModeChange('AUTO')}
                >
                  AUTO
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
