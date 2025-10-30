import { useState, type DragEvent } from 'react';
import './WorkspaceBlock.css';

interface WorkspaceLogBlockProps {
  onDragStart: (type: string) => void;
  onDragEnd: () => void;
}

export default function WorkspaceLogBlock({ onDragStart, onDragEnd }: WorkspaceLogBlockProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart('log');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <div
      className={`workspace-block ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="workspace-block-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="7" y1="8" x2="17" y2="8" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="7" y1="16" x2="17" y2="16" />
        </svg>
      </div>
      <div className="workspace-block-label">System Log</div>
    </div>
  );
}
