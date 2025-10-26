import './Header.css';
import UserMenu, { type UserInfo, type PresenceStatus, type Language, type Theme } from './UserMenu';

type ServerStatus = 'connected' | 'disconnected' | 'connecting';

interface HeaderProps {
  serverStatus: ServerStatus;
  onRetry?: () => void;
  user: UserInfo;
  presence: PresenceStatus;
  language: Language;
  theme: Theme;
  onPresenceChange: (presence: PresenceStatus) => void;
  onLanguageChange: (lang: Language) => void;
  onThemeChange: (theme: Theme) => void;
  onViewProfile: () => void;
  onPreferences: () => void;
  onSignOut: () => void;
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
  onRetry,
  user,
  presence,
  language,
  theme,
  onPresenceChange,
  onLanguageChange,
  onThemeChange,
  onViewProfile,
  onPreferences,
  onSignOut,
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
          <img
            src="/userlmn_818a63cf60696c1f2360a25ad38f18b2.png"
            alt="App logo"
            className="app-logo"
          />
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
          {serverStatus === 'disconnected' && onRetry && (
            <button
              className="retry-btn"
              onClick={onRetry}
              aria-label="Retry server connection"
            >
              Retry
            </button>
          )}
        </div>
        <UserMenu
          user={user}
          presence={presence}
          language={language}
          theme={theme}
          onPresenceChange={onPresenceChange}
          onLanguageChange={onLanguageChange}
          onThemeChange={onThemeChange}
          onViewProfile={onViewProfile}
          onPreferences={onPreferences}
          onSignOut={onSignOut}
        />
      </div>
    </header>
  );
}

export type { ServerStatus };
