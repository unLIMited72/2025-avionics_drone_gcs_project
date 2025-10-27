import './Header.css';

type ServerStatus = 'connected' | 'disconnected' | 'connecting';

interface HeaderProps {
  serverStatus: ServerStatus;
  onLogoClick: () => void;
}

const STATUS_CONFIG = {
  connected: {
    label: 'Server: Connected',
    tooltip: 'Server connection established',
    className: 'connected'
  },
  disconnected: {
    label: 'Server: Disconnected',
    tooltip: 'Server not reachable',
    className: 'disconnected'
  },
  connecting: {
    label: 'Server: Connecting…',
    tooltip: 'Attempting to connect to server',
    className: 'connecting'
  }
};

export default function Header({
  serverStatus,
  onLogoClick
}: HeaderProps) {
  const statusInfo = STATUS_CONFIG[serverStatus];

  return (
    <header className="gcs-header">
      <div className="header-left">
        <button
          className="logo-btn"
          onClick={onLogoClick}
          aria-label="Toggle dashboard"
        >
          <svg className="app-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L4 7V11C4 15.55 7.16 19.74 12 21C16.84 19.74 20 15.55 20 11V7L12 3Z" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(0, 212, 255, 0.1)"/>
            <circle cx="12" cy="12" r="2" fill="#00d4ff"/>
            <circle cx="7" cy="8" r="1.5" fill="#00d4ff"/>
            <circle cx="17" cy="8" r="1.5" fill="#00d4ff"/>
            <circle cx="7" cy="16" r="1.5" fill="#00d4ff"/>
            <circle cx="17" cy="16" r="1.5" fill="#00d4ff"/>
            <line x1="7" y1="8" x2="9.5" y2="10.5" stroke="#00d4ff" strokeWidth="1"/>
            <line x1="17" y1="8" x2="14.5" y2="10.5" stroke="#00d4ff" strokeWidth="1"/>
            <line x1="7" y1="16" x2="9.5" y2="13.5" stroke="#00d4ff" strokeWidth="1"/>
            <line x1="17" y1="16" x2="14.5" y2="13.5" stroke="#00d4ff" strokeWidth="1"/>
          </svg>
        </button>
        <h1 className="app-title">Drone Control Station</h1>
      </div>
      <div className="header-right">
        <div
          className={`server-status ${statusInfo.className}`}
          title={statusInfo.tooltip}
          role="status"
          aria-live="polite"
        >
          <span className="status-indicator">
            {serverStatus === 'connecting' && (
              <span className="spinner"></span>
            )}
          </span>
          <span className="status-text">{statusInfo.label}</span>
        </div>
      </div>
    </header>
  );
}

export type { ServerStatus };
