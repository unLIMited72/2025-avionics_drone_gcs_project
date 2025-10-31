import { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';
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

const MINIMAP_WIDTH = 220;
const MINIMAP_HEIGHT = 140;
const CANVAS_WIDTH = 4000;
const CANVAS_HEIGHT = 3000;
const MIN_BOX_SIZE = 12;
const ARROW_STEP = 20;

function Minimap({
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

  const { scaleX, scaleY, viewportBox } = useMemo(() => {
    const scaleX = MINIMAP_WIDTH / CANVAS_WIDTH;
    const scaleY = MINIMAP_HEIGHT / CANVAS_HEIGHT;

    const visibleWorldWidth = viewportWidth / zoom;
    const visibleWorldHeight = viewportHeight / zoom;

    const boxWidth = Math.max(MIN_BOX_SIZE, (visibleWorldWidth / CANVAS_WIDTH) * MINIMAP_WIDTH);
    const boxHeight = Math.max(MIN_BOX_SIZE, (visibleWorldHeight / CANVAS_HEIGHT) * MINIMAP_HEIGHT);

    const boxX = Math.max(0, Math.min(MINIMAP_WIDTH - boxWidth, (MINIMAP_WIDTH / 2 - pan.x * scaleX) - boxWidth / 2));
    const boxY = Math.max(0, Math.min(MINIMAP_HEIGHT - boxHeight, (MINIMAP_HEIGHT / 2 - pan.y * scaleY) - boxHeight / 2));

    return {
      scaleX,
      scaleY,
      viewportBox: { x: boxX, y: boxY, width: boxWidth, height: boxHeight }
    };
  }, [viewportWidth, viewportHeight, zoom, pan]);

  const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!minimapRef.current) return;

    const rect = minimapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const canvasX = (clickX - MINIMAP_WIDTH / 2) / scaleX;
    const canvasY = (clickY - MINIMAP_HEIGHT / 2) / scaleY;

    onPanChange(-canvasX, -canvasY);
  }, [scaleX, scaleY, onPanChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    handleMinimapClick(e);
  }, [handleMinimapClick]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!minimapRef.current) return;

      const rect = minimapRef.current.getBoundingClientRect();
      onPanChange(
        -((e.clientX - rect.left - MINIMAP_WIDTH / 2) / scaleX),
        -((e.clientY - rect.top - MINIMAP_HEIGHT / 2) / scaleY)
      );
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, scaleX, scaleY, onPanChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

    e.preventDefault();
    const deltaX = e.key === 'ArrowLeft' ? ARROW_STEP : e.key === 'ArrowRight' ? -ARROW_STEP : 0;
    const deltaY = e.key === 'ArrowUp' ? ARROW_STEP : e.key === 'ArrowDown' ? -ARROW_STEP : 0;
    onPanChange(pan.x + deltaX, pan.y + deltaY);
  }, [pan, onPanChange]);

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
              left: `${(block.x + CANVAS_WIDTH / 2) * scaleX}px`,
              top: `${(block.y + CANVAS_HEIGHT / 2) * scaleY}px`,
            }}
          />
        ))}

        <div
          className="minimap-viewport"
          style={{
            left: `${viewportBox.x}px`,
            top: `${viewportBox.y}px`,
            width: `${viewportBox.width}px`,
            height: `${viewportBox.height}px`,
          }}
        />
      </div>

      <div className="minimap-label">Map</div>
    </div>
  );
}

export default memo(Minimap);
