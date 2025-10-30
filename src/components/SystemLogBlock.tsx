import { type DragEvent } from 'react';
import './SystemLogBlock.css';

interface SystemLogBlockProps {
  onDragStart?: (e: DragEvent) => void;
}

export default function SystemLogBlock({ onDragStart }: SystemLogBlockProps) {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('blockType', 'log');
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <div
      className="system-log-block"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="block-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="7" y1="8" x2="17" y2="8" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="7" y1="16" x2="17" y2="16" />
        </svg>
      </div>
      <div className="block-content">
        <div className="block-title">System Log</div>
        <div className="block-description">Real-time drone status logs and system messages.</div>
      </div>
    </div>
  );
}
