import { useState, useRef, useEffect } from 'react';

interface GearMenuProps {
  canMakeNode: boolean;
  canUngroup: boolean;
  onDragSelectClick: () => void;
  onMakeNodeClick: () => void;
  onUngroupClick: () => void;
}

export default function GearMenu({
  canMakeNode,
  canUngroup,
  onDragSelectClick,
  onMakeNodeClick,
  onUngroupClick
}: GearMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMenuItemClick = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }} className="gear-menu-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        title="Additional Features"
        aria-label="Additional Features Menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
          <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24M4.93 19.07l4.24-4.24m5.66-5.66 4.24-4.24" />
        </svg>
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          minWidth: '180px',
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.4)',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          padding: '8px',
          zIndex: 200,
          animation: 'dropdown-appear 0.2s ease'
        }}>
          <button
            onClick={() => handleMenuItemClick(onDragSelectClick)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '14px',
              fontWeight: 500,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            Drag Select
          </button>
          <button
            onClick={() => handleMenuItemClick(onMakeNodeClick)}
            disabled={!canMakeNode}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: canMakeNode ? '#e0e0e0' : 'rgba(224, 224, 224, 0.4)',
              fontSize: '14px',
              fontWeight: 500,
              textAlign: 'left',
              cursor: canMakeNode ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              opacity: canMakeNode ? 1 : 0.4
            }}
          >
            Make Node
          </button>
          <button
            onClick={() => handleMenuItemClick(onUngroupClick)}
            disabled={!canUngroup}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: canUngroup ? '#e0e0e0' : 'rgba(224, 224, 224, 0.4)',
              fontSize: '14px',
              fontWeight: 500,
              textAlign: 'left',
              cursor: canUngroup ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              opacity: canUngroup ? 1 : 0.4
            }}
          >
            Ungroup Node
          </button>
        </div>
      )}
    </div>
  );
}
