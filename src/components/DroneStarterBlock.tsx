import { type DragEvent } from 'react';
import './DroneStarterBlock.css';

interface DroneStarterBlockProps {
  onDragStart?: (e: DragEvent) => void;
}

export default function DroneStarterBlock({ onDragStart }: DroneStarterBlockProps) {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('blockType', 'drone-starter');
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <div
      className="drone-starter-block"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="block-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L8 6H4v4l4 4-4 4v4h4l4 4 4-4h4v-4l-4-4 4-4V6h-4l-4-4z" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      </div>
      <div className="block-content">
        <div className="block-title">Drone Starter</div>
        <div className="block-description">Connect and control drone with serial number, arm/disarm, and flight modes.</div>
      </div>
    </div>
  );
}
