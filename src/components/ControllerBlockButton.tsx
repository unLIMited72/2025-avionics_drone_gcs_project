import { type DragEvent } from 'react';
import './ControllerBlockButton.css';

interface ControllerBlockButtonProps {
  onDragStart?: (e: DragEvent) => void;
}

export default function ControllerBlockButton({ onDragStart }: ControllerBlockButtonProps) {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('blockType', 'controller');
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <div
      className="controller-block-button"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="block-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <circle cx="8" cy="14" r="2" />
          <circle cx="16" cy="14" r="2" />
        </svg>
      </div>
      <div className="block-content">
        <div className="block-title">Controller</div>
        <div className="block-description">Flight control & limits</div>
      </div>
    </div>
  );
}
