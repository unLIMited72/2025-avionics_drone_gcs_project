import { useState, useCallback, useRef } from 'react';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_SPEED, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/workspace';

export function useWorkspaceZoom() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mainRef = useRef<HTMLDivElement>(null);

  const clampPan = useCallback((x: number, y: number, currentZoom: number) => {
    if (!mainRef.current) return { x, y };

    const { clientWidth, clientHeight } = mainRef.current;
    const maxPanX = (CANVAS_WIDTH * currentZoom - clientWidth) / 2;
    const maxPanY = (CANVAS_HEIGHT * currentZoom - clientHeight) / 2;

    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, y))
    };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (!mainRef.current) return;

    const rect = mainRef.current.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const delta = e.deltaY > 0 ? (1 - ZOOM_SPEED) : (1 + ZOOM_SPEED);
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * delta));

    if (newZoom === zoom) return;

    const scaleRatio = newZoom / zoom;
    const newPanX = pointerX - (pointerX - centerX - pan.x) * scaleRatio - centerX;
    const newPanY = pointerY - (pointerY - centerY - pan.y) * scaleRatio - centerY;

    setZoom(newZoom);
    setPan(clampPan(newPanX, newPanY, newZoom));
  }, [zoom, pan, clampPan]);

  const clientToWorld = useCallback((clientX: number, clientY: number) => {
    if (!mainRef.current) return { x: 0, y: 0 };

    const rect = mainRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const viewportX = clientX - rect.left;
    const viewportY = clientY - rect.top;

    const worldX = (viewportX - centerX) / zoom - pan.x;
    const worldY = (viewportY - centerY) / zoom - pan.y;

    return { x: worldX, y: worldY };
  }, [pan, zoom]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return {
    zoom,
    pan,
    isDragging,
    dragStart,
    mainRef,
    setIsDragging,
    setDragStart,
    setPan,
    clampPan,
    handleWheel,
    clientToWorld,
    resetView
  };
}
