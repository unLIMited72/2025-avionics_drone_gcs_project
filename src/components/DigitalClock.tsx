import { useState, useEffect } from 'react';
import GearMenu from './GearMenu';

interface DigitalClockProps {
  onReset?: () => void;
  gearMenuProps?: {
    canMakeNode: boolean;
    canUngroup: boolean;
    onDragSelectClick: () => void;
    onMakeNodeClick: () => void;
    onUngroupClick: () => void;
  };
}

export default function DigitalClock({ onReset, gearMenuProps }: DigitalClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <div style={{
      position: 'fixed',
      top: '72px',
      right: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 150
    }} className="digital-clock">
      {gearMenuProps && (
        <GearMenu
          canMakeNode={gearMenuProps.canMakeNode}
          canUngroup={gearMenuProps.canUngroup}
          onDragSelectClick={gearMenuProps.onDragSelectClick}
          onMakeNodeClick={gearMenuProps.onMakeNodeClick}
          onUngroupClick={gearMenuProps.onUngroupClick}
        />
      )}
      <button
        onClick={onReset}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.4)',
          color: '#00d4ff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease'
        }}
        title="Reset view to default"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M3 21v-5h5"/>
        </svg>
      </button>
      <div style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
        border: '1px solid rgba(0, 212, 255, 0.4)',
        borderRadius: '8px',
        padding: '8px 16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: '2px'
        }}>
          <span style={{
            fontSize: '20px',
            fontWeight: 700,
            fontFamily: '"Courier New", monospace',
            color: '#00d4ff',
            textShadow: '0 0 8px rgba(0, 212, 255, 0.4)',
            letterSpacing: '1px',
            lineHeight: 1
          }}>{hours}</span>
          <span style={{
            fontSize: '20px',
            fontWeight: 700,
            fontFamily: '"Courier New", monospace',
            color: 'rgba(0, 212, 255, 0.6)',
            lineHeight: 1
          }}>:</span>
          <span style={{
            fontSize: '20px',
            fontWeight: 700,
            fontFamily: '"Courier New", monospace',
            color: '#00d4ff',
            textShadow: '0 0 8px rgba(0, 212, 255, 0.4)',
            letterSpacing: '1px',
            lineHeight: 1
          }}>{minutes}</span>
          <span style={{
            fontSize: '20px',
            fontWeight: 700,
            fontFamily: '"Courier New", monospace',
            color: 'rgba(0, 212, 255, 0.6)',
            lineHeight: 1
          }}>:</span>
          <span style={{
            fontSize: '20px',
            fontWeight: 700,
            fontFamily: '"Courier New", monospace',
            color: '#00d4ff',
            textShadow: '0 0 8px rgba(0, 212, 255, 0.4)',
            letterSpacing: '1px',
            lineHeight: 1
          }}>{seconds}</span>
        </div>
      </div>
    </div>
  );
}
