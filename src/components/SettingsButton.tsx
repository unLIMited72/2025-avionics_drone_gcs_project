import { useState, useRef, useEffect } from 'react';
import './SettingsButton.css';

interface SettingsButtonProps {
  onDragSelectToggle: () => void;
  onMakeNode: () => void;
  onUngroupNode: () => void;
  isDragSelectActive: boolean;
  canMakeNode: boolean;
  canUngroupNode: boolean;
  isVisible: boolean;
}

export default function SettingsButton({
  onDragSelectToggle,
  onMakeNode,
  onUngroupNode,
  isDragSelectActive,
  canMakeNode,
  canUngroupNode,
  isVisible
}: SettingsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
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
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleDragSelect = () => {
    onDragSelectToggle();
    setIsOpen(false);
  };

  const handleMakeNode = () => {
    if (canMakeNode) {
      onMakeNode();
      setIsOpen(false);
    }
  };

  const handleUngroupNode = () => {
    if (canUngroupNode) {
      onUngroupNode();
      setIsOpen(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="settings-container">
      <button
        ref={buttonRef}
        className={`settings-btn ${isDragSelectActive ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Additional features"
        aria-label="Additional features menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6M1 12h6m6 0h6"/>
          <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24M4.93 19.07l4.24-4.24m5.66-5.66 4.24-4.24"/>
        </svg>
        {isDragSelectActive && <span className="active-indicator"></span>}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="settings-dropdown"
          role="menu"
          aria-label="Settings menu"
        >
          <button
            className={`dropdown-item ${isDragSelectActive ? 'active' : ''}`}
            onClick={handleDragSelect}
            role="menuitem"
            aria-label="Toggle drag select mode"
          >
            <span className="item-icon">
              {isDragSelectActive ? '✓' : '○'}
            </span>
            <span className="item-text">Drag Select</span>
          </button>

          <button
            className={`dropdown-item ${!canMakeNode ? 'disabled' : ''}`}
            onClick={handleMakeNode}
            disabled={!canMakeNode}
            role="menuitem"
            aria-label="Make node from selected boxes"
          >
            <span className="item-icon">⬢</span>
            <span className="item-text">Make Node</span>
          </button>

          <button
            className={`dropdown-item ${!canUngroupNode ? 'disabled' : ''}`}
            onClick={handleUngroupNode}
            disabled={!canUngroupNode}
            role="menuitem"
            aria-label="Ungroup selected node"
          >
            <span className="item-icon">⬡</span>
            <span className="item-text">Ungroup Node</span>
          </button>
        </div>
      )}
    </div>
  );
}
