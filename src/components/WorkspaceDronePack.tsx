import { useState, useRef, useEffect, type MouseEvent } from 'react';
import './WorkspaceDronePack.css';

interface WorkspaceDronePackProps {
  id: string;
  initialX: number;
  initialY: number;
  zoom: number;
  onRemove: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

export default function WorkspaceDronePack({
  id,
  initialX,
  initialY,
  zoom,
  onRemove,
  onPositionChange
}: WorkspaceDronePackProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const blockRef = useRef<HTMLDivElement>(null);

  const [droneId, setDroneId] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const [px4Connection] = useState<'connected' | 'disconnected'>('connected');
  const [failsafe] = useState<'normal' | 'active'>('normal');
  const [ekfStatus] = useState<'ok' | 'unstable' | 'invalid'>('ok');
  const [gpsStatus] = useState({
    fixType: 3,
    satellites: 12,
    hdop: 0.8,
    glitch: false
  });
  const [homePosition] = useState<'set' | 'not_set'>('set');
  const [imuStatus] = useState<'active' | 'no_data'>('active');
  const [barometerStatus] = useState<'ok' | 'error'>('ok');
  const [batteryInfo] = useState({
    percentage: 85,
    voltage: 22.4,
    amperage: 12.3
  });

  const [maxSpeed, setMaxSpeed] = useState('15');
  const [maxAltitude, setMaxAltitude] = useState('100');
  const [flightMode, setFlightMode] = useState<'mission' | 'controller'>('mission');

  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [heading, setHeading] = useState(0);

  const [armState, setArmState] = useState<'disarmed' | 'arming' | 'armed' | 'disarming'>('disarmed');
  const [currentMode] = useState<'Pre-flight' | 'Offboard' | 'RTL - Land'>('Pre-flight');

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  useEffect(() => {
    if (isConnected) {
      const animationInterval = setInterval(() => {
        const time = Date.now() / 1000;
        setPitch(Math.sin(time * 0.5) * 15);
        setRoll(Math.sin(time * 0.3) * 30);
        setHeading((prev) => (prev + 1) % 360);
      }, 50);

      return () => clearInterval(animationInterval);
    }
  }, [isConnected]);

  const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, button, .attitude-indicator, .compass, .flight-settings-zone')) {
      return;
    }

    setDragStart({ x: e.clientX, y: e.clientY });
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

  const handleConnect = () => {
    if (droneId.trim()) {
      setIsConnected(true);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const handleSetLimits = () => {
    console.log('Setting limits:', { maxSpeed, maxAltitude });
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

  const getGpsHealthStatus = (): 'ok' | 'warning' | 'error' => {
    if (gpsStatus.glitch || gpsStatus.fixType === 0) return 'error';
    if (gpsStatus.fixType >= 3 && gpsStatus.satellites >= 8 && gpsStatus.hdop < 1.0) return 'ok';
    return 'warning';
  };

  const getGpsStatusText = (): string => {
    const fixTypes = ['No Fix', '1D', '2D', '3D', 'RTK Float', 'RTK Fixed'];
    return fixTypes[gpsStatus.fixType] || 'Unknown';
  };

  return (
    <div
      ref={blockRef}
      className={`workspace-drone-pack ${isDragging ? 'dragging' : ''} ${isConnected ? 'connected' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="workspace-block-header">
        <div className="workspace-block-title">
          {isConnected ? `Drone Pack - ID ${droneId}` : 'Drone Pack'}
        </div>
        <button className="workspace-block-remove" onClick={handleRemove}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="drone-pack-body">
        {!isConnected ? (
          <div className="connection-form">
            <div className="form-group">
              <label className="form-label">Drone ID</label>
              <input
                type="number"
                className="drone-id-input"
                placeholder="Enter drone ID"
                value={droneId}
                onChange={(e) => setDroneId(e.target.value)}
              />
            </div>
            <button
              className="connect-btn"
              onClick={handleConnect}
              disabled={!droneId.trim()}
            >
              CONNECT
            </button>
          </div>
        ) : (
          <div className="unified-dashboard">
            <div className="system-health-zone">
              <div className="zone-header">System Health</div>
              <div className="health-items">
                <div className="health-item">
                  <span className={`health-indicator health-${px4Connection}`}></span>
                  <div className="health-info">
                    <div className="health-label">Heartbeat</div>
                    <div className={`health-value health-${px4Connection}`}>
                      {px4Connection === 'connected' ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                </div>

                <div className="health-item">
                  <span className={`health-indicator health-${failsafe === 'normal' ? 'ok' : 'error'}`}></span>
                  <div className="health-info">
                    <div className="health-label">Failsafe</div>
                    <div className={`health-value health-${failsafe === 'normal' ? 'ok' : 'error'}`}>
                      {failsafe === 'normal' ? 'Normal' : 'Active'}
                    </div>
                  </div>
                </div>

                <div className="health-item">
                  <span className={`health-indicator health-${ekfStatus}`}></span>
                  <div className="health-info">
                    <div className="health-label">EKF</div>
                    <div className={`health-value health-${ekfStatus}`}>
                      {ekfStatus === 'ok' ? 'OK' : ekfStatus === 'unstable' ? 'Unstable' : 'Invalid'}
                    </div>
                  </div>
                </div>

                <div className="health-item">
                  <span className={`health-indicator health-${getGpsHealthStatus()}`}></span>
                  <div className="health-info">
                    <div className="health-label">GPS</div>
                    <div className={`health-value health-${getGpsHealthStatus()}`}>
                      {getGpsStatusText()} ({gpsStatus.satellites} sats)
                    </div>
                  </div>
                </div>

                <div className="health-item">
                  <span className={`health-indicator health-${homePosition === 'set' ? 'ok' : 'error'}`}></span>
                  <div className="health-info">
                    <div className="health-label">Home</div>
                    <div className={`health-value health-${homePosition === 'set' ? 'ok' : 'error'}`}>
                      {homePosition === 'set' ? 'Set' : 'Not Set'}
                    </div>
                  </div>
                </div>

                <div className="health-item">
                  <span className={`health-indicator health-${imuStatus === 'active' ? 'ok' : 'error'}`}></span>
                  <div className="health-info">
                    <div className="health-label">IMU</div>
                    <div className={`health-value health-${imuStatus === 'active' ? 'ok' : 'error'}`}>
                      {imuStatus === 'active' ? 'Active' : 'No Data'}
                    </div>
                  </div>
                </div>

                <div className="health-item">
                  <span className={`health-indicator health-${barometerStatus}`}></span>
                  <div className="health-info">
                    <div className="health-label">Barometer</div>
                    <div className={`health-value health-${barometerStatus}`}>
                      {barometerStatus === 'ok' ? 'OK' : 'Error'}
                    </div>
                  </div>
                </div>

                <div className="battery-section">
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

            <div className="flight-settings-zone">
              <div className="zone-header">Flight Settings</div>
              <div className="settings-content">
                <div className="limits-section">
                  <div className="limit-group">
                    <label className="limit-label">Max Speed (m/s)</label>
                    <input
                      type="number"
                      className="limit-input"
                      value={maxSpeed}
                      onChange={(e) => setMaxSpeed(e.target.value)}
                    />
                  </div>
                  <div className="limit-group">
                    <label className="limit-label">Max Altitude (m)</label>
                    <input
                      type="number"
                      className="limit-input"
                      value={maxAltitude}
                      onChange={(e) => setMaxAltitude(e.target.value)}
                    />
                  </div>
                  <button className="set-limits-btn" onClick={handleSetLimits}>
                    SET
                  </button>
                </div>

                <div className="mode-section">
                  <div className="mode-label">Control Mode</div>
                  <div className="mode-options">
                    <button
                      className={`mode-option ${flightMode === 'mission' ? 'active' : ''}`}
                      onClick={() => setFlightMode('mission')}
                    >
                      <div className="mode-checkbox">
                        {flightMode === 'mission' && '✓'}
                      </div>
                      <span>Mission Flight</span>
                    </button>
                    <button
                      className={`mode-option ${flightMode === 'controller' ? 'active' : ''}`}
                      onClick={() => setFlightMode('controller')}
                    >
                      <div className="mode-checkbox">
                        {flightMode === 'controller' && '✓'}
                      </div>
                      <span>Controller Flight</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flight-display-zone">
              <div className="zone-header">Flight Display</div>
              <div className="instruments">
                <div className="attitude-indicator">
                  <div className="attitude-frame"></div>
                  <div className="roll-scale" style={{ transform: `rotate(${roll}deg)` }}>
                    <div className="roll-tick roll-tick-0"></div>
                    <div className="roll-tick roll-tick-20"></div>
                    <div className="roll-tick roll-tick-45"></div>
                    <div className="roll-tick roll-tick-340"></div>
                    <div className="roll-tick roll-tick-315"></div>
                  </div>
                  <div className="horizon">
                    <div
                      className="horizon-rotating"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${roll}deg) translateY(${pitch * 2}px)`
                      }}
                    >
                      <div className="sky"></div>
                      <div className="ground"></div>
                      <div className="horizon-line"></div>
                    </div>
                    <div className="aircraft-symbol">
                      <div className="aircraft-line left"></div>
                      <div className="aircraft-center"></div>
                      <div className="aircraft-line right"></div>
                    </div>
                  </div>
                </div>

                <div className="compass">
                  <div className="compass-rose">
                    <div className="compass-marker marker-n">N</div>
                    <div className="compass-marker marker-e">E</div>
                    <div className="compass-marker marker-s">S</div>
                    <div className="compass-marker marker-w">W</div>
                  </div>
                  <div className="heading-arrow" style={{ transform: `translate(-50%, -50%) rotate(${heading}deg)` }}></div>
                  <div className="heading-value">{String(heading).padStart(3, '0')}°</div>
                </div>

                <div className="telemetry-data">
                  <div className="telemetry-item altitude">
                    <div className="telemetry-label">Altitude</div>
                    <div className="telemetry-value">120 m</div>
                  </div>
                  <div className="telemetry-item velocity">
                    <div className="telemetry-label">Velocity</div>
                    <div className="telemetry-value">15.2 m/s</div>
                  </div>
                  <div className="telemetry-item acceleration">
                    <div className="telemetry-label">Acceleration</div>
                    <div className="telemetry-value">2.3 m/s²</div>
                  </div>
                  <div className="telemetry-item position">
                    <div className="telemetry-label">Position</div>
                    <div className="position-coords">
                      <div>Lat: 37.7749°</div>
                      <div>Lon: -122.4194°</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="arm-control-zone">
              <div className="zone-header">Arm Control</div>
              <div className="arm-content">
                <div className="status-display">
                  <div className="status-label">Status</div>
                  <div className={`status-value status-${armState}`}>
                    {armState === 'disarmed' && 'DISARMED'}
                    {armState === 'arming' && 'ARMING...'}
                    {armState === 'armed' && 'ARMED'}
                    {armState === 'disarming' && 'DISARMING...'}
                  </div>
                </div>

                <div className="mode-display">
                  <div className="mode-display-label">Flight Mode</div>
                  <div className="mode-display-value">{currentMode}</div>
                </div>

                <button
                  className={`arm-button arm-${armState}`}
                  onClick={handleArmToggle}
                  disabled={armState === 'arming' || armState === 'disarming'}
                >
                  {armState === 'disarmed' ? 'ARM' : armState === 'armed' ? 'DISARM' : '...'}
                </button>

                <button className="disconnect-btn-small" onClick={handleDisconnect}>
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
