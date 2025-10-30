import { type DragEvent } from 'react';
import './FlightStateBlock.css';

interface FlightStateBlockProps {
  onDragStart?: (e: DragEvent) => void;
  onClickAdd?: () => void;
}

export default function FlightStateBlock({ onDragStart, onClickAdd }: FlightStateBlockProps) {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('blockType', 'flight-state-info');
    console.info('FD_DRAG_START', { type: 'flight-state-info', clientX: e.clientX, clientY: e.clientY });
    if (onDragStart) {
      onDragStart(e);
    }
  };

  const handleDoubleClick = () => {
    console.info('FD_CLICK_ADD', { type: 'flight-state-info', position: 'center' });
    if (onClickAdd) {
      onClickAdd();
    } else {
      window.dispatchEvent(new CustomEvent('addFlightDisplay', {
        detail: { type: 'flight-state-info', position: 'center' }
      }));
    }
  };

  return (
    <div
      className="flight-state-block"
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      title="Drag to canvas or double-click to add at center"
    >
      <div className="block-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2 L12 12 L16 8" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
      </div>
      <div className="block-content">
        <div className="block-title">Primary Flight Display</div>
        <div className="block-description">Displays attitude indicator, heading compass, altitude, position, and velocity.</div>
      </div>
    </div>
  );
}
