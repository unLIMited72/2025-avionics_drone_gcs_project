import { type DragEvent } from 'react';
import './FlightStateBlock.css';

interface FlightStateBlockProps {
  onDragStart?: (e: DragEvent) => void;
}

export default function FlightStateBlock({ onDragStart }: FlightStateBlockProps) {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('blockType', 'flight-state-info');
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <div
      className="flight-state-block"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="block-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <div className="block-content">
        <div className="block-title">Flight State Information</div>
        <div className="block-description">Displays attitude, position, velocity, status, and mode information.</div>
      </div>
    </div>
  );
}
