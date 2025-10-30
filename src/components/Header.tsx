export type ServerStatus = 'connected' | 'disconnected' | 'connecting';

interface HeaderProps {
  serverStatus: ServerStatus;
  onLogoClick: () => void;
}

export default function Header({ serverStatus, onLogoClick }: HeaderProps) {
  const statusColor = {
    connected: '#00ff88',
    disconnected: '#ff5050',
    connecting: '#ffaa00'
  }[serverStatus];

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '72px',
      background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%)',
      borderBottom: '2px solid rgba(0, 212, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <button
        onClick={onLogoClick}
        style={{
          background: 'none',
          border: 'none',
          color: '#00d4ff',
          fontSize: '24px',
          fontWeight: 700,
          cursor: 'pointer',
          padding: '8px 16px'
        }}
      >
        GCS
      </button>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: statusColor,
          boxShadow: `0 0 12px ${statusColor}`
        }} />
        <span style={{
          color: '#e0e0e0',
          fontSize: '14px',
          fontWeight: 500
        }}>
          {serverStatus === 'connected' ? 'Connected' : serverStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
        </span>
      </div>
    </header>
  );
}
