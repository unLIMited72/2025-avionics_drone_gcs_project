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
          <polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8" />
        </svg>
      </div>
      <div className="block-content">
        <div className="block-title">Drone Starter</div>
        <div className="block-description">Start and control drone operations.</div>
      </div>
    </div>
  );
}
