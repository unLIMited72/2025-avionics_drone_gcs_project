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
  const [isConnected, setIsConnected] = useState(false);

  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [heading, setHeading] = useState(0);

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

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, button')) {
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
    if (serialNumber.trim()) {
      setIsConnected(true);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  useEffect(() => {
    if (isConnected) {
      setPitch(0);
      setRoll(0);
      setHeading(0);

      const animationInterval = setInterval(() => {
        const time = Date.now() / 1000;
        setPitch(Math.sin(time * 0.5) * 15);
        setRoll(Math.sin(time * 0.3) * 30);
        setHeading((prev) => (prev + 1) % 360);
      }, 50);

      return () => clearInterval(animationInterval);
    }
  }, [isConnected]);

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
            <span className="drone-serial">Drone #{serialNumber}</span>
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
          {!isConnected && (
            <div className="input-wrapper">
              <input
                type="text"
                className="drone-input"
                placeholder="Serial Number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>
          )}
          {!isConnected ? (
            <button
              className="connect-btn"
              onClick={handleConnect}
              disabled={!serialNumber.trim()}
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
          <div className="integrated-display-container">
            <div className="pfd-section">
              <div className="left-instruments">
                <div className="attitude-indicator">
                  <div className="attitude-frame-outer"></div>
                  <div className="attitude-frame-inner"></div>
                  <div className="roll-marker"></div>
                  <div
                    className="roll-scale"
                    style={{
                      transform: `rotate(${roll}deg)`
                    }}
                  >
                    <div className="roll-tick roll-tick-0"></div>
                    <div className="roll-tick roll-tick-20"></div>
                    <div className="roll-tick roll-tick-45"></div>
                    <div className="roll-tick roll-tick-340"></div>
                    <div className="roll-tick roll-tick-315"></div>
                  </div>
                  <div className="horizon" style={{ clipPath: 'circle(50px at 50px 50px)' }}>
                    <div
                      className="horizon-rotating"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${roll}deg) translateY(${pitch * 2}px)`
                      }}
                    >
                      <div className="sky"></div>
                      <div className="ground"></div>
                      <div className="horizon-line"></div>

                      <div className="pitch-line pitch-25">
                        <span className="pitch-bar short"></span>
                      </div>
                      <div className="pitch-line pitch-20">
                        <span className="pitch-label left">20</span>
                        <span className="pitch-bar"></span>
                        <span className="pitch-label right">20</span>
                      </div>
                      <div className="pitch-line pitch-15">
                        <span className="pitch-bar short"></span>
                      </div>
                      <div className="pitch-line pitch-10">
                        <span className="pitch-label left">10</span>
                        <span className="pitch-bar"></span>
                        <span className="pitch-label right">10</span>
                      </div>
                      <div className="pitch-line pitch-5">
                        <span className="pitch-bar short"></span>
                      </div>
                      <div className="pitch-line pitch-minus-5">
                        <span className="pitch-bar short"></span>
                      </div>
                      <div className="pitch-line pitch-minus-10">
                        <span className="pitch-label left">10</span>
                        <span className="pitch-bar"></span>
                        <span className="pitch-label right">10</span>
                      </div>
                      <div className="pitch-line pitch-minus-15">
                        <span className="pitch-bar short"></span>
                      </div>
                      <div className="pitch-line pitch-minus-20">
                        <span className="pitch-label left">20</span>
                        <span className="pitch-bar"></span>
                        <span className="pitch-label right">20</span>
                      </div>
                      <div className="pitch-line pitch-minus-25">
                        <span className="pitch-bar short"></span>
                      </div>
                    </div>
                    <div className="aircraft-symbol">
                      <div className="aircraft-line left"></div>
                      <div className="aircraft-center"></div>
                      <div className="aircraft-line right"></div>
                    </div>
                  </div>
                </div>

                <div className="heading-indicator">
                  <div className="heading-frame-outer"></div>
                  <div className="heading-frame-inner"></div>
                  <div className="compass">
                    <div className="compass-rose">
                      <div className="compass-marker marker-0">N</div>
                      <div className="compass-marker marker-90">E</div>
                      <div className="compass-marker marker-180">S</div>
                      <div className="compass-marker marker-270">W</div>
                      <div className="compass-tick tick-30"></div>
                      <div className="compass-tick tick-60"></div>
                      <div className="compass-tick tick-120"></div>
                      <div className="compass-tick tick-150"></div>
                      <div className="compass-tick tick-210"></div>
                      <div className="compass-tick tick-240"></div>
                      <div className="compass-tick tick-300"></div>
                      <div className="compass-tick tick-330"></div>
                    </div>
                    <div className="heading-arrow" style={{ transform: `translate(-50%, -50%) rotate(${heading}deg)` }}></div>
                    <div className="heading-value">{String(heading).padStart(3, '0')}°</div>
                  </div>
                </div>
              </div>

              <div className="pfd-vertical-metrics">
                <div className="altitude-display">
                  <div className="altitude-label">Altitude</div>
                  <div className="altitude-value">120 m</div>
                </div>
                <div className="altitude-display velocity-display">
                  <div className="altitude-label">Velocity</div>
                  <div className="altitude-value">12.5 m/s</div>
                </div>
                <div className="altitude-display acceleration-display">
                  <div className="altitude-label">Acceleration</div>
                  <div className="altitude-value">2.3 m/s²</div>
                </div>
                <div className="altitude-display position-display">
                  <div className="altitude-label">Position</div>
                  <div className="position-values">
                    <div className="position-item">
                      <span className="position-label">Lat:</span>
                      <span className="position-value">37.7749°</span>
                    </div>
                    <div className="position-item">
                      <span className="position-label">Lon:</span>
                      <span className="position-value">-122.4194°</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
          </div>
        )}
      </div>
    </div>
  );
}
