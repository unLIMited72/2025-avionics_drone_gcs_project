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
        <div className="telemetry-item altitude-item">
          <div className="telemetry-icon">ALT</div>
          <div className="altitude-gauge">
            <svg viewBox="0 0 200 120" className="gauge-svg">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#00d4ff', stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: '#00d4ff', stopOpacity: 0.8 }} />
                </linearGradient>
              </defs>

              {/* Background arc */}
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
                strokeLinecap="round"
              />

              {/* Progress arc */}
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(data.altitude / 300) * 220} 220`}
              />

              {/* Scale marks */}
              {[0, 50, 100, 150, 200, 250, 300].map((mark) => {
                const angle = -90 + (mark / 300) * 180;
                const rad = (angle * Math.PI) / 180;
                const x1 = 100 + 65 * Math.cos(rad);
                const y1 = 100 + 65 * Math.sin(rad);
                const x2 = 100 + 55 * Math.cos(rad);
                const y2 = 100 + 55 * Math.sin(rad);

                return (
                  <g key={mark}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#00d4ff"
                      strokeWidth="2"
                    />
                    <text
                      x={100 + 80 * Math.cos(rad)}
                      y={100 + 80 * Math.sin(rad)}
                      fill="#00d4ff"
                      fontSize="10"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {mark}
                    </text>
                  </g>
                );
              })}

              {/* Needle */}
              <line
                x1="100"
                y1="100"
                x2={100 + 50 * Math.cos((-90 + (data.altitude / 300) * 180) * Math.PI / 180)}
                y2={100 + 50 * Math.sin((-90 + (data.altitude / 300) * 180) * Math.PI / 180)}
                stroke="#00ff88"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Center dot */}
              <circle cx="100" cy="100" r="5" fill="#00ff88" />
            </svg>
          </div>
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
