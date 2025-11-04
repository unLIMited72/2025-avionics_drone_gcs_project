import { type DragEvent } from 'react';
import './DronePackBlock.css';

interface DronePackBlockProps {
  onDragStart?: (e: DragEvent) => void;
}

export default function DronePackBlock({ onDragStart }: DronePackBlockProps) {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('blockType', 'drone-pack');
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <div
      className="drone-pack-block"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="block-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="9" x2="9" y2="21" />
          <line x1="15" y1="9" x2="15" y2="21" />
        </svg>
      </div>
      <div className="block-content">
        <div className="block-title">Drone Pack</div>
        <div className="block-description">Unified dashboard with health, controls, telemetry, and arm status.</div>
      </div>
    </div>
  );
}
