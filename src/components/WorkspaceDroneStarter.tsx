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

  const [px4Connection] = useState<'connected' | 'disconnected'>('disconnected');
  const [failsafe] = useState<'normal' | 'active'>('normal');
  const [ekfStatus] = useState<'ok' | 'unstable' | 'invalid'>('invalid');
  const [gpsStatus] = useState<{ fixType: number; satellites: number; hdop: number; glitch: boolean }>({
    fixType: 0,
    satellites: 0,
    hdop: 99.9,
    glitch: false
  });
  const [homePosition] = useState<'set' | 'not_set'>('not_set');
  const [imuStatus] = useState<'active' | 'no_data'>('no_data');
  const [barometerStatus] = useState<'ok' | 'error'>('error');

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

        {isConnected && (
          <div className="system-health-panel">
            <div className="panel-header">System Health</div>

            <div className="health-grid">
              <div className="health-item">
                <div className="health-icon">
                  <span className={`health-indicator health-${px4Connection}`}></span>
                </div>
                <div className="health-info">
                  <div className="health-label">Heartbeat</div>
                  <div className={`health-value health-${px4Connection}`}>
                    {px4Connection === 'connected' ? 'Connected' : 'Disconnected'}
                  </div>
                </div>
              </div>

              <div className="health-item">
                <div className="health-icon">
                  <span className={`health-indicator health-${failsafe === 'normal' ? 'ok' : 'error'}`}></span>
                </div>
                <div className="health-info">
                  <div className="health-label">Failsafe</div>
                  <div className={`health-value health-${failsafe === 'normal' ? 'ok' : 'error'}`}>
                    {failsafe === 'normal' ? 'Normal' : 'Active'}
                  </div>
                </div>
              </div>

              <div className="health-item">
                <div className="health-icon">
                  <span className={`health-indicator health-${ekfStatus}`}></span>
                </div>
                <div className="health-info">
                  <div className="health-label">EKF Estimation</div>
                  <div className={`health-value health-${ekfStatus}`}>
                    {ekfStatus === 'ok' ? 'OK' : ekfStatus === 'unstable' ? 'Unstable' : 'Invalid'}
                  </div>
                </div>
              </div>

              <div className="health-item">
                <div className="health-icon">
                  <span className={`health-indicator health-${getGpsHealthStatus()}`}></span>
                </div>
                <div className="health-info">
                  <div className="health-label">GPS Status</div>
                  <div className={`health-value health-${getGpsHealthStatus()}`}>
                    {getGpsStatusText()}
                    {gpsStatus.glitch && <span className="warning-badge">GLITCH</span>}
                  </div>
                  <div className="health-sat-count">
                    {gpsStatus.satellites} sats
                  </div>
                </div>
              </div>

              <div className="health-item">
                <div className="health-icon">
                  <span className={`health-indicator health-${homePosition === 'set' ? 'ok' : 'error'}`}></span>
                </div>
                <div className="health-info">
                  <div className="health-label">Home Position</div>
                  <div className={`health-value health-${homePosition === 'set' ? 'ok' : 'error'}`}>
                    {homePosition === 'set' ? 'Set' : 'Not Set'}
                  </div>
                </div>
              </div>

              <div className="health-item">
                <div className="health-icon">
                  <span className={`health-indicator health-${imuStatus === 'active' ? 'ok' : 'error'}`}></span>
                </div>
                <div className="health-info">
                  <div className="health-label">IMU Sensor</div>
                  <div className={`health-value health-${imuStatus === 'active' ? 'ok' : 'error'}`}>
                    {imuStatus === 'active' ? 'Active' : 'No Data'}
                  </div>
                </div>
              </div>

              <div className="health-item">
                <div className="health-icon">
                  <span className={`health-indicator health-${barometerStatus}`}></span>
                </div>
                <div className="health-info">
                  <div className="health-label">Barometer</div>
                  <div className={`health-value health-${barometerStatus}`}>
                    {barometerStatus === 'ok' ? 'OK' : 'Error'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function getGpsHealthStatus(): 'ok' | 'warning' | 'error' {
    if (gpsStatus.glitch || gpsStatus.fixType === 0) return 'error';
    if (gpsStatus.fixType >= 3 && gpsStatus.satellites >= 8 && gpsStatus.hdop < 1.0) return 'ok';
    return 'warning';
  }

  function getGpsStatusText(): string {
    const fixTypes = ['No Fix', '1D', '2D', '3D', 'RTK Float', 'RTK Fixed'];
    return fixTypes[gpsStatus.fixType] || 'Unknown';
  }
}
