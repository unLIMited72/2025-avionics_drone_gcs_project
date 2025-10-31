import { useState, useEffect, useCallback, type MouseEvent } from 'react';

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
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (disabled) return;

    const target = e.target as HTMLElement;

    if (shouldPreventDrag && shouldPreventDrag(target)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const blockElement = target.closest('.workspace-block, .controller-block, .workspace-drone-starter, .workspace-log') as HTMLElement;
    if (blockElement) {
      const rect = blockElement.getBoundingClientRect();
      const offsetX = (e.clientX - rect.left) / zoom;
      const offsetY = (e.clientY - rect.top) / zoom;
      setDragOffset({ x: offsetX, y: offsetY });
    }

    setIsDragging(true);
  }, [shouldPreventDrag, disabled, zoom]);

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      e.preventDefault();
      const newX = (e.clientX / zoom) - dragOffset.x;
      const newY = (e.clientY / zoom) - dragOffset.y;

      setPosition({ x: newX, y: newY });
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
  }, [isDragging, dragOffset, position, zoom, id, onPositionChange]);

  return {
    position,
    isDragging,
    handleMouseDown
  };
}
