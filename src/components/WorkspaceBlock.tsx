import { useState, useRef, useEffect, type MouseEvent } from 'react';
import './WorkspaceBlock.css';

interface WorkspaceBlockProps {
  id: string;
  initialX: number;
  initialY: number;
  zoom: number;
  onRemove: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onToggleMinimize: (id: string) => void;
  isMinimized: boolean;
  velocity: number;
  acceleration: number;
}

export default function WorkspaceBlock({
  id,
  initialX,
  initialY,
  zoom,
  onRemove,
  onPositionChange,
  onToggleMinimize,
  isMinimized,
  velocity,
  acceleration
}: WorkspaceBlockProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [heading, setHeading] = useState(0);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  useEffect(() => {
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
  }, []);

  const handleMouseDown = (e: MouseEvent) => {
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

  const handleMinimize = (e: MouseEvent) => {
    e.stopPropagation();
    onToggleMinimize(id);
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleMinimize(id);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      onRemove(id);
    }
  };

  return (
    <div
      ref={blockRef}
      className={`workspace-block ${isDragging ? 'dragging' : ''}`}
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
        <div className="workspace-block-title">Primary Flight Display</div>
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
      {!isMinimized && <div className="workspace-block-body">
        <div className="instruments-row">
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

          <div className="pfd-vertical-metrics-workspace">
            <div className="altitude-display">
              <div className="altitude-label">Altitude</div>
              <div className="altitude-value">120 m</div>
            </div>
            <div className="altitude-display velocity-display">
              <div className="altitude-label">Velocity</div>
              <div className="altitude-value">{velocity.toFixed(1)} m/s</div>
            </div>
            <div className="altitude-display acceleration-display">
              <div className="altitude-label">Acceleration</div>
              <div className="altitude-value">{acceleration.toFixed(1)} m/s²</div>
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
      </div>}
    </div>
  );
}
