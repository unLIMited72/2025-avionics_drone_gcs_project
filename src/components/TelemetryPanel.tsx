import './TelemetryPanel.css';

interface TelemetryData {
  altitude: number;
  speed: number;
  battery: number;
  heading: number;
  satellites: number;
  flightMode: string;
  velocity: number;
  acceleration: number;
}

interface TelemetryPanelProps {
  data: TelemetryData;
}

export default function TelemetryPanel({ data }: TelemetryPanelProps) {
  const getBatteryColor = (level: number) => {
    if (level > 50) return '#00ff88';
    if (level > 20) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <div className="telemetry-panel">
      <div className="panel-header">
        <h2>Primary Flight Display</h2>
      </div>
      <div className="pfd-container">
        <div className="pfd-gauges">
          <div className="circular-gauge">
            <svg viewBox="0 0 120 120" className="gauge-svg">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0, 212, 255, 0.2)" strokeWidth="2"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(0, 212, 255, 0.1)" strokeWidth="1"/>
              <text x="60" y="40" textAnchor="middle" className="gauge-label">SPD</text>
              <text x="60" y="70" textAnchor="middle" className="gauge-value">{data.speed.toFixed(1)}</text>
              <text x="60" y="85" textAnchor="middle" className="gauge-unit">m/s</text>
            </svg>
          </div>

          <div className="pfd-vertical-metrics">
            <div className="pfd-altitude">
              <div className="altitude-value">{data.altitude.toFixed(1)}</div>
              <div className="altitude-label">Alt m</div>
            </div>
            <div className="pfd-altitude pfd-velocity">
              <div className="altitude-value">{data.velocity.toFixed(1)}</div>
              <div className="altitude-label">Vel m/s</div>
            </div>
            <div className="pfd-altitude pfd-acceleration">
              <div className="altitude-value">{data.acceleration.toFixed(1)}</div>
              <div className="altitude-label">Acc m/s²</div>
            </div>
          </div>

          <div className="circular-gauge">
            <svg viewBox="0 0 120 120" className="gauge-svg">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0, 212, 255, 0.2)" strokeWidth="2"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(0, 212, 255, 0.1)" strokeWidth="1"/>
              <text x="60" y="40" textAnchor="middle" className="gauge-label">HDG</text>
              <text x="60" y="70" textAnchor="middle" className="gauge-value">{data.heading}</text>
              <text x="60" y="85" textAnchor="middle" className="gauge-unit">°</text>
              <line
                x1="60"
                y1="60"
                x2="60"
                y2="20"
                stroke="#00d4ff"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${data.heading} 60 60)`}
              />
            </svg>
          </div>
        </div>

        <div className="pfd-secondary">
          <div className="pfd-info-item">
            <span className="pfd-info-label">BAT</span>
            <span className="pfd-info-value" style={{ color: getBatteryColor(data.battery) }}>
              {data.battery}%
            </span>
            <div className="battery-bar-mini">
              <div
                className="battery-fill-mini"
                style={{
                  width: `${data.battery}%`,
                  backgroundColor: getBatteryColor(data.battery)
                }}
              ></div>
            </div>
          </div>

          <div className="pfd-info-item">
            <span className="pfd-info-label">SAT</span>
            <span className="pfd-info-value">{data.satellites}</span>
          </div>

          <div className="pfd-info-item">
            <span className="pfd-info-label">MODE</span>
            <span className="pfd-mode-badge">{data.flightMode}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
