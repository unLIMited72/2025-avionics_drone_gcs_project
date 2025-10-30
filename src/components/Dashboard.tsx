interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Dashboard({ isOpen }: DashboardProps) {
  return (
    <aside style={{
      position: 'fixed',
      top: '72px',
      left: 0,
      width: '320px',
      height: 'calc(100vh - 72px)',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      borderRight: '2px solid rgba(0, 212, 255, 0.3)',
      boxShadow: '4px 0 16px rgba(0, 0, 0, 0.3)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(0, 212, 255, 0.15)'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          color: '#e0e0e0',
          letterSpacing: '0.5px'
        }}>
          Drone Function Block
        </h2>
      </div>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            padding: '12px',
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '6px',
            color: '#e0e0e0',
            fontSize: '14px'
          }}>
            Drag blocks to canvas
          </div>
        </div>
      </div>
    </aside>
  );
}
