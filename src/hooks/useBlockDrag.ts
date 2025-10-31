import { useState, useEffect, useCallback, useRef, type MouseEvent } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseBlockDragOptions {
  initialX: number;
  initialY: number;
  zoom: number;
  id: string;
  onPositionChange: (id: string, x: number, y: number) => void;
  shouldPreventDrag?: (target: HTMLElement) => boolean;
  disabled?: boolean;
}

export function useBlockDrag({
  initialX,
  initialY,
  zoom,
  id,
  onPositionChange,
  shouldPreventDrag,
  disabled = false
}: UseBlockDragOptions) {
  const [position, setPosition] = useState<Position>({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      setPosition({ x: initialX, y: initialY });
      hasInitialized.current = true;
    }
  }, [initialX, initialY]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (disabled) return;

    const target = e.target as HTMLElement;

    if (shouldPreventDrag && shouldPreventDrag(target)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(true);
  }, [shouldPreventDrag, disabled, zoom]);

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      e.preventDefault();
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      setPosition(prev => ({
        x: prev.x + deltaX - dragOffset.x,
        y: prev.y + deltaY - dragOffset.y
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragOffset({ x: 0, y: 0 });
    };

    const handleGlobalMouseUp = (e: globalThis.MouseEvent) => {
      e.preventDefault();
      setIsDragging(false);
      onPositionChange(id, position.x, position.y);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, dragOffset, position, zoom, id, onPositionChange]);

  return {
    position,
    isDragging,
    handleMouseDown
  };
}
