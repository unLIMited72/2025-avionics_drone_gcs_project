import { useState } from 'react';
import './MissionControl.css';

interface MissionControlProps {
  onCommand: (command: string) => void;
}

export default function MissionControl({ onCommand }: MissionControlProps) {
  const [targetAltitude, setTargetAltitude] = useState('10');

  return (
    <div className="mission-control">
      <div className="panel-header">
        <h2>Mission Control</h2>
      </div>
      <div className="control-content">
        <div className="control-section">
          <h3 className="section-title">Flight Commands</h3>
          <div className="button-grid">
            <button
              className="control-btn arm-btn"
              onClick={() => onCommand('ARM')}
            >
              Arm
            </button>
            <button
              className="control-btn disarm-btn"
              onClick={() => onCommand('DISARM')}
            >
              Disarm
            </button>
            <button
              className="control-btn takeoff-btn"
              onClick={() => onCommand('TAKEOFF')}
            >
              Takeoff
            </button>
            <button
              className="control-btn land-btn"
              onClick={() => onCommand('LAND')}
            >
              Land
            </button>
            <button
              className="control-btn rth-btn"
              onClick={() => onCommand('RTH')}
            >
              Return Home
            </button>
            <button
              className="control-btn emergency-btn"
              onClick={() => onCommand('EMERGENCY_STOP')}
            >
              Emergency Stop
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3 className="section-title">Altitude Control</h3>
          <div className="altitude-control">
            <input
              type="number"
              className="altitude-input"
              value={targetAltitude}
              onChange={(e) => setTargetAltitude(e.target.value)}
              min="0"
              max="100"
              step="1"
            />
            <span className="input-unit">meters</span>
            <button
              className="control-btn set-altitude-btn"
              onClick={() => onCommand(`SET_ALTITUDE:${targetAltitude}`)}
            >
              Set Altitude
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3 className="section-title">Flight Modes</h3>
          <div className="mode-grid">
            <button
              className="mode-btn"
              onClick={() => onCommand('MODE:STABILIZE')}
            >
              Stabilize
            </button>
            <button
              className="mode-btn"
              onClick={() => onCommand('MODE:LOITER')}
            >
              Loiter
            </button>
            <button
              className="mode-btn"
              onClick={() => onCommand('MODE:AUTO')}
            >
              Auto
            </button>
            <button
              className="mode-btn"
              onClick={() => onCommand('MODE:GUIDED')}
            >
              Guided
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
