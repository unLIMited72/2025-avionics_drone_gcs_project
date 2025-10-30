import { type DragEvent } from 'react';
import './LogBlock.css';

interface LogBlockProps {
  onDragStart?: (e: DragEvent) => void;
}

export default function LogBlock({ onDragStart }: LogBlockProps) {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('blockType', 'log');
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <div
      className="log-block"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="block-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="7" y1="8" x2="17" y2="8" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="7" y1="16" x2="13" y2="16" />
        </svg>
      </div>
      <div className="block-content">
        <div className="block-title">Log Terminal</div>
        <div className="block-description">Display real-time drone status logs in terminal-style output.</div>
      </div>
    </div>
  );
}
