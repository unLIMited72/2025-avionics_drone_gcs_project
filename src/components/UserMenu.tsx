import { useState, useRef, useEffect } from 'react';
import './UserMenu.css';

type PresenceStatus = 'online' | 'dnd' | 'offline';
type Language = 'en' | 'ko';
type Theme = 'dark' | 'light';

interface UserInfo {
  name: string;
  email: string;
  role: string;
  organization?: string;
  avatarUrl?: string;
  lastLogin: string;
  sessionExpiresIn?: number;
  twoFactorEnabled: boolean;
}

interface UserMenuProps {
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
}

export default function UserMenu({
  user,
  presence,
  language,
  theme,
  onPresenceChange,
  onLanguageChange,
  onThemeChange,
  onViewProfile,
  onPreferences,
  onSignOut
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPresenceLabel = (status: PresenceStatus) => {
    switch (status) {
      case 'online': return 'Online';
      case 'dnd': return 'Do Not Disturb';
      case 'offline': return 'Offline';
    }
  };

  const formatLastLogin = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSessionTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="user-menu-container">
      <button
        ref={buttonRef}
        className="user-avatar-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="User"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="avatar-image" />
        ) : (
          <div className="avatar-initials">{getInitials(user.name)}</div>
        )}
        <span className={`presence-indicator presence-${presence}`}></span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="user-menu-popover"
          role="menu"
          aria-label="User menu"
        >
          <section className="menu-section profile-summary">
            <div className="profile-header">
              <div className="profile-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} />
                ) : (
                  <div className="avatar-initials-large">{getInitials(user.name)}</div>
                )}
              </div>
              <div className="profile-info">
                <div className="profile-name">{user.name}</div>
                <div className="profile-meta">
                  <span className="role-badge">{user.role}</span>
                  {user.organization && (
                    <span className="org-text">{user.organization}</span>
                  )}
                </div>
                <div className="profile-email">{user.email}</div>
              </div>
            </div>
          </section>

          <div className="menu-divider"></div>

          <section className="menu-section">
            <h3 className="section-header">Status & Session</h3>
            <div className="presence-selector" role="group" aria-label="Presence status">
              {(['online', 'dnd', 'offline'] as PresenceStatus[]).map((status) => (
                <button
                  key={status}
                  className={`presence-option ${presence === status ? 'active' : ''}`}
                  onClick={() => {
                    onPresenceChange(status);
                  }}
                  role="menuitemradio"
                  aria-checked={presence === status}
                >
                  <span className={`presence-dot presence-${status}`}></span>
                  {getPresenceLabel(status)}
                </button>
              ))}
            </div>
            <div className="session-info">
              <div className="session-item">
                <span className="session-label">Last login:</span>
                <span className="session-value">{formatLastLogin(user.lastLogin)}</span>
              </div>
              {user.sessionExpiresIn && (
                <div className="session-item">
                  <span className="session-label">Session expires in:</span>
                  <span className="session-value">{formatSessionTime(user.sessionExpiresIn)}</span>
                </div>
              )}
            </div>
          </section>

          <div className="menu-divider"></div>

          <section className="menu-section">
            <h3 className="section-header">Quick Actions</h3>
            <button
              className="menu-item"
              onClick={() => {
                onViewProfile();
                setIsOpen(false);
              }}
              role="menuitem"
            >
              View Profile
            </button>
            <button
              className="menu-item"
              onClick={() => {
                onPreferences();
                setIsOpen(false);
              }}
              role="menuitem"
            >
              Preferences
            </button>

            <div className="menu-item-group">
              <div className="menu-item-label">Language</div>
              <div className="toggle-group">
                <button
                  className={`toggle-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={() => onLanguageChange('en')}
                  role="menuitemradio"
                  aria-checked={language === 'en'}
                >
                  English
                </button>
                <button
                  className={`toggle-btn ${language === 'ko' ? 'active' : ''}`}
                  onClick={() => onLanguageChange('ko')}
                  role="menuitemradio"
                  aria-checked={language === 'ko'}
                >
                  Korean
                </button>
              </div>
            </div>

            <div className="menu-item-group">
              <div className="menu-item-label">Theme</div>
              <div className="toggle-group">
                <button
                  className={`toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => onThemeChange('dark')}
                  role="menuitemradio"
                  aria-checked={theme === 'dark'}
                >
                  Dark
                </button>
                <button
                  className={`toggle-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => onThemeChange('light')}
                  role="menuitemradio"
                  aria-checked={theme === 'light'}
                >
                  Light
                </button>
              </div>
            </div>

            <div className="menu-item-group">
              <div className="menu-item-label">Account Security</div>
              <div className="security-status">
                Two-factor: <span className={user.twoFactorEnabled ? 'status-on' : 'status-off'}>
                  {user.twoFactorEnabled ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </section>

          <div className="menu-divider"></div>

          <section className="menu-section">
            <button
              className="menu-item sign-out-btn"
              onClick={() => {
                onSignOut();
                setIsOpen(false);
              }}
              role="menuitem"
            >
              Sign out
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export type { UserInfo, PresenceStatus, Language, Theme };
