import { useState, useRef, useEffect, type MouseEvent } from 'react';
import './LogBlock.css';

interface LogBlockProps {
  id: string;
  initialX: number;
  initialY: number;
  zoom: number;
  onRemove: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
}

export default function LogBlock({
  id,
  initialX,
  initialY,
  zoom,
  onRemove,
  onPositionChange
}: LogBlockProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const blockRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: '00:00:00', message: 'System initialized', level: 'success' },
    { timestamp: '00:00:01', message: 'Connecting to drone...', level: 'info' },
    { timestamp: '00:00:02', message: 'Connection established', level: 'success' },
    { timestamp: '00:00:03', message: 'Ready for flight', level: 'info' },
  ]);

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.log-content, button')) {
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
        onPositionChange(id, newX, newY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, position, zoom, id, onPositionChange]);

  const handleClear = () => {
    setLogs([]);
  };

  const getLogLevelClass = (level: string) => {
    switch (level) {
      case 'success': return 'log-success';
      case 'warning': return 'log-warning';
      case 'error': return 'log-error';
      default: return 'log-info';
    }
  };

  return (
    <div
      ref={blockRef}
      className={`log-block ${isDragging ? 'dragging' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={handleMouseDown}
    >
      <div className="log-header">
        <div className="log-header-left">
          <div className="log-title">System Log</div>
          <div className="log-subtitle">Drone Status Monitor</div>
        </div>
        <button className="log-close-btn" onClick={() => onRemove(id)}>×</button>
      </div>

      <div className="log-body">
        <div className="log-toolbar">
          <div className="log-info">
            <span className="log-count">{logs.length} entries</span>
          </div>
          <button className="clear-btn" onClick={handleClear}>
            Clear
          </button>
        </div>

        <div className="log-content">
          {logs.map((log, index) => (
            <div key={index} className={`log-entry ${getLogLevelClass(log.level)}`}>
              <span className="log-timestamp">[{log.timestamp}]</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
