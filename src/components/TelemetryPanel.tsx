import './TelemetryPanel.css';

interface TelemetryData {
  altitude: number;
  speed: number;
  battery: number;
  heading: number;
  satellites: number;
  flightMode: string;
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
        <h2>Telemetry</h2>
      </div>
      <div className="telemetry-grid">
        <div className="telemetry-item">
          <div className="telemetry-icon">ALT</div>
          <div className="telemetry-data">
            <span className="telemetry-value">{data.altitude.toFixed(1)}</span>
            <span className="telemetry-unit">m</span>
          </div>
          <div className="telemetry-label">Altitude</div>
        </div>

        <div className="telemetry-item">
          <div className="telemetry-icon">SPD</div>
          <div className="telemetry-data">
            <span className="telemetry-value">{data.speed.toFixed(1)}</span>
            <span className="telemetry-unit">m/s</span>
          </div>
          <div className="telemetry-label">Speed</div>
        </div>

        <div className="telemetry-item">
          <div className="telemetry-icon">BAT</div>
          <div className="telemetry-data">
            <span className="telemetry-value" style={{ color: getBatteryColor(data.battery) }}>
              {data.battery}
            </span>
            <span className="telemetry-unit">%</span>
          </div>
          <div className="telemetry-label">Battery</div>
          <div className="battery-bar">
            <div
              className="battery-fill"
              style={{
                width: `${data.battery}%`,
                backgroundColor: getBatteryColor(data.battery)
              }}
            ></div>
          </div>
        </div>

        <div className="telemetry-item">
          <div className="telemetry-icon">HDG</div>
          <div className="telemetry-data">
            <span className="telemetry-value">{data.heading}</span>
            <span className="telemetry-unit">°</span>
          </div>
          <div className="telemetry-label">Heading</div>
        </div>

        <div className="telemetry-item">
          <div className="telemetry-icon">SAT</div>
          <div className="telemetry-data">
            <span className="telemetry-value">{data.satellites}</span>
            <span className="telemetry-unit"></span>
          </div>
          <div className="telemetry-label">Satellites</div>
        </div>

        <div className="telemetry-item flight-mode-item">
          <div className="telemetry-icon">MODE</div>
          <div className="flight-mode-badge">{data.flightMode}</div>
        </div>
      </div>
    </div>
  );
}
