import { useState, useRef, useEffect } from 'react';
import './PlanTools.css';

interface PlanToolsProps {
  onDragSelectStart: () => void;
  onMakeNode: () => void;
  onUngroupNode: () => void;
  canMakeNode: boolean;
  canUngroup: boolean;
}

export default function PlanTools({
  onDragSelectStart,
  onMakeNode,
  onUngroupNode,
  canMakeNode,
  canUngroup
}: PlanToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleDragSelect = () => {
    setIsOpen(false);
    onDragSelectStart();
  };

  const handleMakeNode = () => {
    if (canMakeNode) {
      setIsOpen(false);
      onMakeNode();
    }
  };

  const handleUngroup = () => {
    if (canUngroup) {
      setIsOpen(false);
      onUngroupNode();
    }
  };

  return (
    <div className="plan-tools" ref={dropdownRef}>
      <button
        className="plan-tools-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Additional Features"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
        </svg>
      </button>
      {isOpen && (
        <div className="plan-tools-dropdown">
          <button className="dropdown-item" onClick={handleDragSelect}>
            Drag Select
          </button>
          <button
            className={`dropdown-item ${!canMakeNode ? 'disabled' : ''}`}
            onClick={handleMakeNode}
            disabled={!canMakeNode}
          >
            Make Node
          </button>
          <button
            className={`dropdown-item ${!canUngroup ? 'disabled' : ''}`}
            onClick={handleUngroup}
            disabled={!canUngroup}
          >
            Ungroup Node
          </button>
        </div>
      )}
    </div>
  );
}
