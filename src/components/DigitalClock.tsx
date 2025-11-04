import { useState, useEffect } from 'react';
import './DigitalClock.css';

interface DigitalClockProps {
  onReset?: () => void;
  onDragSelect?: () => void;
  onCreateNode?: () => void;
  onUngroupNode?: () => void;
  isDragSelectMode?: boolean;
  canCreateNode?: boolean;
  canUngroup?: boolean;
}

export default function DigitalClock({
  onReset,
  onDragSelect,
  onCreateNode,
  onUngroupNode,
  isDragSelectMode,
  canCreateNode = false,
  canUngroup = false
}: DigitalClockProps) {
  const [time, setTime] = useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.clock-controls')) {
        setIsSettingsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSettingsOpen]);

  return (
    <div className="clock-controls">
      <button
        className="settings-btn"
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        title="Settings"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>

      {isSettingsOpen && (
        <div className="settings-panel">
          <button
            className={`settings-panel-btn ${isDragSelectMode ? 'active' : ''}`}
            onClick={() => {
              onDragSelect?.();
            }}
            title="Toggle drag select mode"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>Drag</span>
          </button>
          <button
            className={`settings-panel-btn ${!canCreateNode ? 'disabled' : ''}`}
            onClick={() => {
              if (!canCreateNode) return;
              onCreateNode?.();
              setIsSettingsOpen(false);
            }}
            disabled={!canCreateNode}
            title="Create node from selected boxes"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 9h6M9 15h6"/>
            </svg>
            <span>Create Node</span>
          </button>
          <button
            className={`settings-panel-btn ${!canUngroup ? 'disabled' : ''}`}
            onClick={() => {
              if (!canUngroup) return;
              onUngroupNode?.();
              setIsSettingsOpen(false);
            }}
            disabled={!canUngroup}
            title="Ungroup selected node"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
            <span>Ungroup</span>
          </button>
        </div>
      )}

      <button
        className="reset-view-btn"
        onClick={onReset}
        title="Reset view to default"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M3 21v-5h5"/>
        </svg>
      </button>
      <div className="digital-clock">
        <div className="clock-display">
          <span className="time-segment">{hours}</span>
          <span className="time-separator">:</span>
          <span className="time-segment">{minutes}</span>
          <span className="time-separator">:</span>
          <span className="time-segment">{seconds}</span>
        </div>
      </div>
    </div>
  );
}
