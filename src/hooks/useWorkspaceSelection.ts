import { useState, useCallback, useEffect } from 'react';
import { type SelectionRect, type DroppedBlock } from '../types/workspace';
import { getBlockDimensions } from '../constants/workspace';

export function useWorkspaceSelection(
  setBlocks: React.Dispatch<React.SetStateAction<DroppedBlock[]>>,
  clientToWorld: (clientX: number, clientY: number) => { x: number; y: number }
) {
  const [isDragSelectMode, setIsDragSelectMode] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [finalRect, setFinalRect] = useState<SelectionRect | null>(null);

  useEffect(() => {
    if (!isSelecting) return;

    const handleSelectMouseMove = (e: MouseEvent) => {
      if (!selectionRect) return;
      const worldPos = clientToWorld(e.clientX, e.clientY);
      setSelectionRect({
        ...selectionRect,
        endX: worldPos.x,
        endY: worldPos.y
      });
    };

    const handleSelectMouseUp = () => {
      setIsSelecting(false);
      if (selectionRect) {
        const selMinX = Math.min(selectionRect.startX, selectionRect.endX);
        const selMaxX = Math.max(selectionRect.startX, selectionRect.endX);
        const selMinY = Math.min(selectionRect.startY, selectionRect.endY);
        const selMaxY = Math.max(selectionRect.startY, selectionRect.endY);

        setBlocks(prevBlocks => prevBlocks.map(block => {
          if (block.nodeId) return block;

          const dimensions = getBlockDimensions(block.type);
          const blockMinX = block.x;
          const blockMaxX = block.x + dimensions.width;
          const blockMinY = block.y;
          const blockMaxY = block.y + dimensions.height;

          const intersects = (
            selMinX < blockMaxX &&
            selMaxX > blockMinX &&
            selMinY < blockMaxY &&
            selMaxY > blockMinY
          );

          return { ...block, isHighlighted: intersects };
        }));

        setFinalRect(selectionRect);
      }
      setIsDragSelectMode(false);
      setSelectionRect(null);
    };

    const handleWindowBlur = () => {
      setIsSelecting(false);
      setIsDragSelectMode(false);
      setSelectionRect(null);
    };

    document.addEventListener('mousemove', handleSelectMouseMove);
    document.addEventListener('mouseup', handleSelectMouseUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('mousemove', handleSelectMouseMove);
      document.removeEventListener('mouseup', handleSelectMouseUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isSelecting, selectionRect, clientToWorld, setBlocks]);

  const handleToggleDragSelect = useCallback(() => {
    setIsDragSelectMode(prev => !prev);
    if (isSelecting) {
      setIsSelecting(false);
    }
    setFinalRect(null);
  }, [isSelecting]);

  const startSelection = useCallback((worldX: number, worldY: number) => {
    setFinalRect(null);
    setBlocks(prevBlocks => prevBlocks.map(block => ({
      ...block,
      isHighlighted: false
    })));

    setIsSelecting(true);
    setSelectionRect({
      startX: worldX,
      startY: worldY,
      endX: worldX,
      endY: worldY
    });
  }, [setBlocks]);

  return {
    isDragSelectMode,
    isSelecting,
    selectionRect,
    finalRect,
    setFinalRect,
    handleToggleDragSelect,
    startSelection
  };
}
