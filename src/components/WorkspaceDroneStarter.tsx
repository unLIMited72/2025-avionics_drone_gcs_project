import { useState, useRef, useEffect } from 'react';
import { useBlockDrag } from '../hooks/useBlockDrag';
import { createHeaderKeyDownHandler, createStopPropagationHandler, shouldPreventDragFromInteractiveElements } from '../utils/blockUtils';
import './WorkspaceDroneStarter.css';

interface WorkspaceDroneStarterProps {
  id: string;
  initialX: number;
  initialY: number;
  zoom: number;
  onRemove: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onToggleMinimize: (id: string) => void;
  isMinimized: boolean;
  nodeName?: string;
  isHighlighted?: boolean;
  onDroneNameChange?: (name: string) => void;
}


export default function WorkspaceDroneStarter({
  id,
  initialX,
  initialY,
  zoom,
  onRemove,
  onPositionChange,
  onToggleMinimize,
  isMinimized,
  nodeName,
  isHighlighted,
  onDroneNameChange
}: WorkspaceDroneStarterProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [droneName, setDroneName] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const [px4Connection] = useState<'connected' | 'disconnected'>('disconnected');
  const [failsafe] = useState<'normal' | 'active'>('normal');
  const [ekfStatus] = useState<'ok' | 'unstable' | 'invalid'>('invalid');
  const [gpsStatus] = useState({
    fixType: 0,
    satellites: 0,
    hdop: 99.9,
    glitch: false
  });
  const [homePosition] = useState<'set' | 'not_set'>('not_set');
  const [imuStatus] = useState<'active' | 'no_data'>('no_data');
  const [barometerStatus] = useState<'ok' | 'error'>('error');
  const [batteryInfo] = useState({
    percentage: 85,
    voltage: 22.4,
    amperage: 12.3
  });
  const [armState, setArmState] = useState<'disarmed' | 'arming' | 'armed' | 'disarming'>('disarmed');
  const [flightMode] = useState<'Pre-flight' | 'Offboard' | 'RTL - Land'>('Pre-flight');

  const { position, isDragging, handleMouseDown } = useBlockDrag({
    initialX,
    initialY,
    zoom,
    id,
    onPositionChange,
    shouldPreventDrag: shouldPreventDragFromInteractiveElements
  });

  const handleRemove = createStopPropagationHandler(() => onRemove(id));
  const handleMinimize = createStopPropagationHandler(() => onToggleMinimize(id));
  const handleHeaderKeyDown = createHeaderKeyDownHandler(
    () => onToggleMinimize(id),
    () => onRemove(id)
  );

  const handleConnect = () => {
    if (serialNumber.trim() && droneName.trim()) {
      setIsConnected(true);
      onDroneNameChange?.(droneName);
    }
  };

  useEffect(() => {
    if (isConnected && droneName) {
      onDroneNameChange?.(droneName);
    }
  }, [droneName, isConnected, onDroneNameChange]);

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const getGpsHealthStatus = (): 'ok' | 'warning' | 'error' => {
    if (gpsStatus.glitch || gpsStatus.fixType === 0) return 'error';
    if (gpsStatus.fixType >= 3 && gpsStatus.satellites >= 8 && gpsStatus.hdop < 1.0) return 'ok';
    return 'warning';
  };

  const getGpsStatusText = (): string => {
    const fixTypes = ['No Fix', '1D', '2D', '3D', 'RTK Float', 'RTK Fixed'];
    return fixTypes[gpsStatus.fixType] || 'Unknown';
  };

  const handleArmToggle = () => {
    if (armState === 'disarmed') {
      setArmState('arming');
      setTimeout(() => setArmState('armed'), 1500);
    } else if (armState === 'armed') {
      setArmState('disarming');
      setTimeout(() => setArmState('disarmed'), 1500);
    }
  };

  return (
    <div
      ref={blockRef}
      className={`workspace-drone-starter ${isDragging ? 'dragging' : ''} ${isHighlighted ? 'is-highlighted' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="workspace-block-header"
        tabIndex={0}
        onKeyDown={handleHeaderKeyDown}
        role="button"
        aria-label="Window header"
      >
        <div className="workspace-block-title">
          {isConnected ? (
            <>
              <span className="drone-name">{droneName}</span>
              <span className="drone-serial">#{serialNumber}</span>
            </>
          ) : (
            'Drone Starter'
          )}
          {nodeName && <span className="node-label"> · {nodeName}</span>}
        </div>
        <div className="header-actions">
          <button
            className="workspace-block-minimize"
            onClick={handleMinimize}
            aria-label={isMinimized ? "Restore" : "Minimize"}
            title={isMinimized ? "Restore" : "Minimize"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            className="workspace-block-remove"
            onClick={handleRemove}
            aria-label="Close"
            title="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && <div className="drone-starter-body">
        <div className="connection-section">
          {!isConnected && (
            <div className="input-wrapper">
              <input
                type="text"
                className="drone-input"
                placeholder="Serial Number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
              <input
                type="text"
                className="drone-input"
                placeholder="Drone Name"
                value={droneName}
                onChange={(e) => setDroneName(e.target.value)}
              />
            </div>
          )}
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
          <div className="health-arm-container">
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
                  <div className="health-values-vertical">
                    <div className={`health-value health-${getGpsHealthStatus()}`}>
                      {getGpsStatusText()}
                      {gpsStatus.glitch && <span className="warning-badge">GLITCH</span>}
                    </div>
                    <div className="health-sat-count">
                      {gpsStatus.satellites} sats
                    </div>
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

              <div className="battery-item">
                <div className="battery-label">Battery</div>
                <div className="battery-display">
                  <div className="battery-icon">
                    <div className="battery-body">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`battery-cell ${i < Math.floor(batteryInfo.percentage / 10) ? 'filled' : ''}`}
                        />
                      ))}
                    </div>
                    <div className="battery-tip"></div>
                  </div>
                  <div className="battery-percentage">{batteryInfo.percentage}%</div>
                </div>
                <div className="battery-stats">
                  <span className="battery-stat">{batteryInfo.voltage.toFixed(1)}V</span>
                  <span className="battery-stat">{batteryInfo.amperage.toFixed(1)}A</span>
                </div>
              </div>
              </div>
            </div>

            <div className="arm-control-panel">
              <div className="arm-section">
                <div className="arm-status-display">
                  <div className="arm-status-label">Status</div>
                  <div className={`arm-status-value arm-status-${armState}`}>
                    {armState === 'disarmed' && 'DISARMED'}
                    {armState === 'arming' && 'ARMING...'}
                    {armState === 'armed' && 'ARMED'}
                    {armState === 'disarming' && 'DISARMING...'}
                  </div>
                </div>
                <button
                  className={`arm-button arm-button-${armState}`}
                  onClick={handleArmToggle}
                  disabled={armState === 'arming' || armState === 'disarming'}
                >
                  <div className="arm-button-inner">
                    <div className="arm-button-icon"></div>
                  </div>
                </button>
              </div>

              <div className="flight-mode-section">
                <div className="mode-status-display">
                  <div className="mode-label">Flight Mode</div>
                  <div className="mode-value">{flightMode}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>}
    </div>
  );
}
