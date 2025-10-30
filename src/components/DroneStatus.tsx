export default function DroneStatus() {
  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
      border: '1px solid rgba(0, 212, 255, 0.4)',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      zIndex: 150
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ff5050'
          }} />
          <span style={{
            color: '#e0e0e0',
            fontSize: '13px',
            fontWeight: 500
          }}>
            No Drone Connected
          </span>
        </div>
      </div>
    </div>
  );
}
