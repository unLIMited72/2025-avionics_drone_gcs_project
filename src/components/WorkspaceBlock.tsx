import { useState, useRef, useEffect, type MouseEvent } from 'react';
import './WorkspaceBlock.css';

interface WorkspaceBlockProps {
  id: string;
  type: string;
  initialX: number;
  initialY: number;
  zoom: number;
  pan: { x: number; y: number };
  onRemove: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

export default function WorkspaceBlock({
  id,
  initialX,
  initialY,
  zoom,
  onRemove,
  onPositionChange
}: WorkspaceBlockProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  useEffect(() => {
    setPitch(0);
    setRoll(0);
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

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      const newX = position.x + deltaX;
      const newY = position.y + deltaY;

      setPosition({ x: newX, y: newY });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      onPositionChange(id, position.x, position.y);
    }
    setIsDragging(false);
  };

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation();
    onRemove(id);
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
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="workspace-block-header">
        <div className="workspace-block-title">Flight State Information</div>
        <button className="workspace-block-remove" onClick={handleRemove}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="workspace-block-body">
        <div className="instruments-row">
          <div className="attitude-indicator">
            <div className="attitude-frame-outer"></div>
            <div className="attitude-frame-inner"></div>
            <div className="roll-marker"></div>
            <div className="horizon" style={{ clipPath: 'circle(50px at 50px 50px)' }}>
              <div
                className="horizon-rotating"
                style={{
                  transform: `translate(-50%, -50%) rotate(${roll}deg) translateY(${pitch * 2}px)`
                }}
              >
                <div className="roll-tick tick-0"></div>
                <div className="roll-tick tick-left-30"></div>
                <div className="roll-tick tick-left-60"></div>
                <div className="roll-tick tick-right-30"></div>
                <div className="roll-tick tick-right-60"></div>
                <div className="sky"></div>
                <div className="ground"></div>
                <div className="horizon-line"></div>
                <div className="pitch-scale">
                  <div className="pitch-line pitch-20">
                    <span className="pitch-label left">20</span>
                    <span className="pitch-bar"></span>
                    <span className="pitch-label right">20</span>
                  </div>
                  <div className="pitch-line pitch-10">
                    <span className="pitch-label left">10</span>
                    <span className="pitch-bar"></span>
                    <span className="pitch-label right">10</span>
                  </div>
                  <div className="pitch-line pitch-minus-10">
                    <span className="pitch-label left">-10</span>
                    <span className="pitch-bar"></span>
                    <span className="pitch-label right">-10</span>
                  </div>
                  <div className="pitch-line pitch-minus-20">
                    <span className="pitch-label left">-20</span>
                    <span className="pitch-bar"></span>
                    <span className="pitch-label right">-20</span>
                  </div>
                </div>
              </div>
              <div className="aircraft-symbol">
                <div className="aircraft-line left"></div>
                <div className="aircraft-center"></div>
                <div className="aircraft-line right"></div>
              </div>
            </div>
          </div>

          <div className="altitude-display">
            <div className="altitude-label">Alt ft.</div>
            <div className="altitude-value">396</div>
          </div>

          <div className="heading-indicator">
            <div className="compass">
              <div className="compass-rose">
                <div className="compass-marker n">N</div>
                <div className="compass-marker e">E</div>
                <div className="compass-marker s">S</div>
                <div className="compass-marker w">W</div>
                <div className="compass-tick tick-30"></div>
                <div className="compass-tick tick-60"></div>
                <div className="compass-tick tick-120"></div>
                <div className="compass-tick tick-150"></div>
                <div className="compass-tick tick-210"></div>
                <div className="compass-tick tick-240"></div>
                <div className="compass-tick tick-300"></div>
                <div className="compass-tick tick-330"></div>
              </div>
              <div className="heading-arrow"></div>
              <div className="heading-value">000</div>
            </div>
          </div>
        </div>

        <div className="flight-data-grid">
          <div className="data-group">
            <div className="group-label">Position</div>
            <div className="group-items">
              <div className="group-item">
                <span className="item-label">Lat:</span>
                <span className="item-value">37.7749°</span>
              </div>
              <div className="group-item">
                <span className="item-label">Lon:</span>
                <span className="item-value">-122.4194°</span>
              </div>
            </div>
          </div>
          <div className="data-group">
            <div className="group-label">Motion</div>
            <div className="group-items">
              <div className="group-item">
                <span className="item-label">Vel:</span>
                <span className="item-value">15.2 m/s</span>
              </div>
              <div className="group-item">
                <span className="item-label">Acc:</span>
                <span className="item-value">2.3 m/s²</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flight-status">
          <div className="status-item">
            <div className="status-label">Mode</div>
            <div className="status-value mode">Mission</div>
          </div>
          <div className="status-item">
            <div className="status-label">Status</div>
            <div className="status-value armed">ARMED</div>
          </div>
        </div>
      </div>
    </div>
  );
}
