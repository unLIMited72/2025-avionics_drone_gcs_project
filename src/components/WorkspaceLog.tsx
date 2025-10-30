import { useState, useRef, useEffect, useCallback } from 'react';
import { useBlockDrag } from '../hooks/useBlockDrag';
import { createHeaderKeyDownHandler, createStopPropagationHandler } from '../utils/blockUtils';
import './WorkspaceLog.css';

interface WorkspaceLogProps {
  id: string;
  initialX: number;
  initialY: number;
  zoom: number;
  onRemove: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onToggleMinimize: (id: string) => void;
  isMinimized: boolean;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export default function WorkspaceLog({
  id,
  initialX,
  initialY,
  zoom,
  onRemove,
  onPositionChange,
  onToggleMinimize,
  isMinimized
}: WorkspaceLogProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: '00:00:01', level: 'info', message: 'System initialized' },
    { timestamp: '00:00:02', level: 'info', message: 'Waiting for drone connection...' },
    { timestamp: '00:00:03', level: 'success', message: 'Drone connected successfully' },
    { timestamp: '00:00:04', level: 'info', message: 'Starting telemetry stream' },
    { timestamp: '00:00:05', level: 'warning', message: 'GPS signal weak - 4 satellites' },
    { timestamp: '00:00:06', level: 'info', message: 'Calibrating sensors...' },
    { timestamp: '00:00:07', level: 'success', message: 'IMU calibration complete' },
    { timestamp: '00:00:08', level: 'error', message: 'EKF estimation invalid' }
  ]);
  const [autoScroll, setAutoScroll] = useState(true);

  const { position, isDragging, handleMouseDown } = useBlockDrag({
    initialX,
    initialY,
    zoom,
    id,
    onPositionChange,
    shouldPreventDrag: (target) => !!target.closest('.log-content, button')
  });

  useEffect(() => {
    if (autoScroll && logs.length > 0 && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [logs, autoScroll]);

  const handleRemove = createStopPropagationHandler(() => onRemove(id));
  const handleMinimize = createStopPropagationHandler(() => onToggleMinimize(id));
  const handleHeaderKeyDown = createHeaderKeyDownHandler(
    () => onToggleMinimize(id),
    () => onRemove(id)
  );

  const handleClearLogs = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAutoScroll(false);
    setLogs([]);
    setTimeout(() => setAutoScroll(true), 100);
  }, []);

  const getLevelColor = (level: LogEntry['level']): string => {
    switch (level) {
      case 'info':
        return '#6496ff';
      case 'success':
        return '#00ff96';
      case 'warning':
        return '#ffaa00';
      case 'error':
        return '#ff6464';
      default:
        return '#e0e0e0';
    }
  };

  const getLevelPrefix = (level: LogEntry['level']): string => {
    switch (level) {
      case 'info':
        return '[INFO]';
      case 'success':
        return '[OK]';
      case 'warning':
        return '[WARN]';
      case 'error':
        return '[ERR]';
      default:
        return '[LOG]';
    }
  };

  return (
    <div
      ref={blockRef}
      className={`workspace-log ${isDragging ? 'dragging' : ''}`}
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
        <div className="workspace-block-title">Log Terminal</div>
        <div className="header-actions">
          <button className="log-clear-btn" onClick={handleClearLogs} title="Clear logs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
            </svg>
          </button>
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

      {!isMinimized && <><div className="log-content" onMouseDown={(e) => e.stopPropagation()}>
        {logs.length === 0 ? (
          <div className="log-empty">Terminal cleared. Waiting for new logs...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="log-entry">
              <span className="log-timestamp">{log.timestamp}</span>
              <span className="log-level" style={{ color: getLevelColor(log.level) }}>
                {getLevelPrefix(log.level)}
              </span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      <div className="log-status">
        <span className="status-text">Ready</span>
      </div></>}
    </div>
  );
}
