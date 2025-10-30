import { useState, useRef, useEffect } from 'react';
import './GearMenu.css';

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
    <div className="gear-menu-container" ref={menuRef}>
      <button
        className="gear-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
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
        <div className="gear-menu-dropdown">
          <button
            className="gear-menu-item"
            onClick={() => handleMenuItemClick(onDragSelectClick)}
          >
            Drag Select
          </button>
          <button
            className="gear-menu-item"
            onClick={() => handleMenuItemClick(onMakeNodeClick)}
            disabled={!canMakeNode}
          >
            Make Node
          </button>
          <button
            className="gear-menu-item"
            onClick={() => handleMenuItemClick(onUngroupClick)}
            disabled={!canUngroup}
          >
            Ungroup Node
          </button>
        </div>
      )}
    </div>
  );
}
