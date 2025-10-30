import { useEffect, useRef, useState } from 'react';
import './Minimap.css';

interface MinimapProps {
  isVisible: boolean;
  canvasWidth: number;
  canvasHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (x: number, y: number) => void;
  blocks: Array<{ id: string; x: number; y: number; type: string }>;
}

export default function Minimap({
  isVisible,
  viewportWidth,
  viewportHeight,
  zoom,
  pan,
  onPanChange,
  blocks
}: MinimapProps) {
  const minimapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const minimapWidth = 220;
  const minimapHeight = 140;

  const totalCanvasWidth = 4000;
  const totalCanvasHeight = 3000;

  const scaleX = minimapWidth / totalCanvasWidth;
  const scaleY = minimapHeight / totalCanvasHeight;

  const visibleWorldWidth = viewportWidth / zoom;
  const visibleWorldHeight = viewportHeight / zoom;

  const viewportBoxWidth = Math.max(12, (visibleWorldWidth / totalCanvasWidth) * minimapWidth);
  const viewportBoxHeight = Math.max(12, (visibleWorldHeight / totalCanvasHeight) * minimapHeight);

  const viewportBoxX = Math.max(0, Math.min(minimapWidth - viewportBoxWidth, (minimapWidth / 2 - pan.x * scaleX) - viewportBoxWidth / 2));
  const viewportBoxY = Math.max(0, Math.min(minimapHeight - viewportBoxHeight, (minimapHeight / 2 - pan.y * scaleY) - viewportBoxHeight / 2));

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!minimapRef.current) return;

    const rect = minimapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const canvasX = (clickX - minimapWidth / 2) / scaleX;
    const canvasY = (clickY - minimapHeight / 2) / scaleY;

    onPanChange(-canvasX, -canvasY);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    handleMinimapClick(e);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!minimapRef.current) return;

      const rect = minimapRef.current.getBoundingClientRect();
      const moveX = e.clientX - rect.left;
      const moveY = e.clientY - rect.top;

      const canvasX = (moveX - minimapWidth / 2) / scaleX;
      const canvasY = (moveY - minimapHeight / 2) / scaleY;

      onPanChange(-canvasX, -canvasY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, scaleX, scaleY, onPanChange, minimapWidth, minimapHeight]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = 20;
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        onPanChange(pan.x, pan.y + step);
        break;
      case 'ArrowDown':
        e.preventDefault();
        onPanChange(pan.x, pan.y - step);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onPanChange(pan.x + step, pan.y);
        break;
      case 'ArrowRight':
        e.preventDefault();
        onPanChange(pan.x - step, pan.y);
        break;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={minimapRef}
      className={`minimap ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="navigation"
      aria-label="Canvas minimap navigation"
    >
      <div className="minimap-canvas">
        <div className="minimap-grid" />

        {blocks.map(block => (
          <div
            key={block.id}
            className="minimap-block"
            style={{
              left: `${(block.x + totalCanvasWidth / 2) * scaleX}px`,
              top: `${(block.y + totalCanvasHeight / 2) * scaleY}px`,
            }}
          />
        ))}

        <div
          className="minimap-viewport"
          style={{
            left: `${viewportBoxX}px`,
            top: `${viewportBoxY}px`,
            width: `${viewportBoxWidth}px`,
            height: `${viewportBoxHeight}px`,
          }}
        />
      </div>

      <div className="minimap-label">Map</div>
    </div>
  );
}
