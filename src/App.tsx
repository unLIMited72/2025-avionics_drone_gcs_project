import { useState, useRef, useEffect } from 'react';
import Header, { type ServerStatus } from './components/Header';
import Dashboard from './components/Dashboard';
import DigitalClock from './components/DigitalClock';
import type { UserInfo, PresenceStatus, Language, Theme } from './components/UserMenu';
import './App.css';

function App() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>('connected');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [user] = useState<UserInfo>({
    name: 'John Smith',
    email: 'john.smith@dronecontrol.io',
    role: 'Operator',
    organization: 'Alpha Team',
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    sessionExpiresIn: 55,
    twoFactorEnabled: true
  });
  const [presence, setPresence] = useState<PresenceStatus>('online');
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mainRef = useRef<HTMLDivElement>(null);

  const handleRetryConnection = () => {
    setServerStatus('connecting');
    setTimeout(() => {
      setServerStatus('connected');
    }, 2000);
  };

  const handlePresenceChange = (newPresence: PresenceStatus) => {
    setPresence(newPresence);
    console.log('Presence changed to:', newPresence);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    console.log('Language changed to:', newLanguage);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    console.log('Theme changed to:', newTheme);
  };

  const handleViewProfile = () => {
    console.log('View Profile clicked');
  };

  const handlePreferences = () => {
    console.log('Preferences clicked');
  };

  const handleSignOut = () => {
    console.log('Sign out clicked');
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => Math.min(Math.max(0.5, prevZoom * delta), 2));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-panel, .digital-clock')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && mainRef.current) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      const viewportWidth = mainRef.current.clientWidth;
      const viewportHeight = mainRef.current.clientHeight;

      const scaledGridWidth = (viewportWidth * 3) * zoom;
      const scaledGridHeight = (viewportHeight * 3) * zoom;

      const maxPanX = Math.max(0, (scaledGridWidth - viewportWidth) / (2 * zoom));
      const maxPanY = Math.max(0, (scaledGridHeight - viewportHeight) / (2 * zoom));

      setPan({
        x: Math.min(Math.max(newX, -maxPanX), maxPanX),
        y: Math.min(Math.max(newY, -maxPanY), maxPanY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.style.cursor = isDragging ? 'grabbing' : 'grab';
    }
  }, [isDragging]);

  return (
    <div className="gcs-app">
      <Header
        serverStatus={serverStatus}
        onRetry={handleRetryConnection}
        user={user}
        presence={presence}
        language={language}
        theme={theme}
        onPresenceChange={handlePresenceChange}
        onLanguageChange={handleLanguageChange}
        onThemeChange={handleThemeChange}
        onViewProfile={handleViewProfile}
        onPreferences={handlePreferences}
        onSignOut={handleSignOut}
        onLogoClick={() => setIsDashboardOpen(!isDashboardOpen)}
      />
      <main
        ref={mainRef}
        className="gcs-main"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="main-background"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center'
          }}
        />
        <Dashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />
        <DigitalClock onReset={handleResetView} />
      </main>
    </div>
  );
}

export default App;
