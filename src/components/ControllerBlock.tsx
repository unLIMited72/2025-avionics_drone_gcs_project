import { useState, useRef } from 'react';
import { useBlockDrag } from '../hooks/useBlockDrag';
import { createHeaderKeyDownHandler, createStopPropagationHandler, shouldPreventDragFromInteractiveElements } from '../utils/blockUtils';
import './ControllerBlock.css';

interface ControllerBlockProps {
  id: string;
  initialX: number;
  initialY: number;
  zoom: number;
  onRemove: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onToggleMinimize: (id: string) => void;
  isMinimized: boolean;
}

type FlightControlMode = 'mission' | 'controller';

export default function ControllerBlock({
  id,
  initialX,
  initialY,
  zoom,
  onRemove,
  onPositionChange,
  onToggleMinimize,
  isMinimized
}: ControllerBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const [maxSpeed, setMaxSpeed] = useState('');
  const [maxAltitude, setMaxAltitude] = useState('');
  const [flightMode, setFlightMode] = useState<FlightControlMode>('mission');
  const [isSaved, setIsSaved] = useState(false);

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

  const handleSet = () => {
    if (maxSpeed.trim() && maxAltitude.trim()) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const isSetDisabled = !maxSpeed.trim() || !maxAltitude.trim();

  return (
    <div
      ref={blockRef}
      className={`controller-block ${isDragging ? 'dragging' : ''}`}
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
        <div className="workspace-block-title">Controller</div>
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

      {!isMinimized && <div className="controller-body">
        <div className="limits-section">
          <div className="section-title">Flight Limits</div>
          <div className="limits-content">
            <div className="limits-inputs">
              <input
                type="number"
                className="limit-input"
                placeholder="Max Speed (m/s)"
                value={maxSpeed}
                onChange={(e) => setMaxSpeed(e.target.value)}
                min="0"
                step="0.1"
              />
              <input
                type="number"
                className="limit-input"
                placeholder="Max Altitude (m)"
                value={maxAltitude}
                onChange={(e) => setMaxAltitude(e.target.value)}
                min="0"
                step="1"
              />
            </div>
            <button
              className={`set-btn ${isSaved ? 'saved' : ''}`}
              onClick={handleSet}
              disabled={isSetDisabled}
            >
              {isSaved ? 'Saved!' : 'Set'}
            </button>
          </div>
        </div>

        <div className="flight-mode-section">
          <div className="section-title">Flight Control Mode</div>
          <div className="mode-checkboxes">
            <label className="mode-checkbox-item">
              <input
                type="checkbox"
                checked={flightMode === 'mission'}
                onChange={() => setFlightMode('mission')}
                className="mode-checkbox"
              />
              <span className="mode-checkbox-label">Mission Flight</span>
            </label>
            <label className="mode-checkbox-item">
              <input
                type="checkbox"
                checked={flightMode === 'controller'}
                onChange={() => setFlightMode('controller')}
                className="mode-checkbox"
              />
              <span className="mode-checkbox-label">Controller Flight</span>
            </label>
          </div>
        </div>
      </div>}
    </div>
  );
}
