import { useState, useRef, useEffect, useCallback, type DragEvent } from 'react';
import Minimap from './Minimap';
import WorkspaceBlock from './WorkspaceBlock';
import WorkspaceDroneStarter from './WorkspaceDroneStarter';
import WorkspaceLog from './WorkspaceLog';
import ControllerBlock from './ControllerBlock';
import DigitalClock from './DigitalClock';
import DroneStatus from './DroneStatus';
import './PlanView.css';

interface Block {
  id: string;
  type: string;
  x: number;
  y: number;
  velocity?: number;
  acceleration?: number;
  isMinimized: boolean;
}

export default function PlanView() {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const saved = localStorage.getItem('workspace-blocks');
    return saved ? JSON.parse(saved) : [];
  });

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mainRef = useRef<HTMLDivElement>(null);

  const CANVAS_WIDTH = 4000;
  const CANVAS_HEIGHT = 3000;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;
  const ZOOM_SPEED = 0.1;

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-panel, .digital-clock, .workspace-block, .controller-block, .workspace-drone-starter, .workspace-log')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!mainRef.current) return;
      setPan(clampPan(e.clientX - dragStart.x, e.clientY - dragStart.y, zoom));
    };

    const handleGlobalMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, zoom, clampPan]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!mainRef.current) return;

    const type = e.dataTransfer.getData('blockType');
    if (!type) return;

    const rect = mainRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2 - pan.x) / zoom;
    const y = (e.clientY - rect.top - rect.height / 2 - pan.y) / zoom;

    const newBlock: Block = {
      id: `${type}-${Date.now()}`,
      type,
      x,
      y,
      velocity: type === 'telemetry' ? 0 : undefined,
      acceleration: type === 'telemetry' ? 0 : undefined,
      isMinimized: false
    };

    setBlocks(prev => [...prev, newBlock]);
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };

  const handleBlockPositionChange = (id: string, x: number, y: number) => {
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, x, y } : block
    ));
  };

  const handleToggleMinimize = (id: string) => {
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, isMinimized: !block.isMinimized } : block
    ));
  };

  const handleMinimapPan = useCallback((x: number, y: number) => {
    setPan(clampPan(x, y, zoom));
  }, [zoom, clampPan]);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    localStorage.setItem('workspace-blocks', JSON.stringify(blocks));
  }, [blocks]);

  return (
    <div className="plan-view">
      <main
        ref={mainRef}
        className="main-canvas"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div
          className="canvas-content"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <div className="grid-background" />
          {blocks.map((block) => {
            if (block.type === 'telemetry') {
              return (
                <WorkspaceBlock
                  key={block.id}
                  id={block.id}
                  initialX={block.x}
                  initialY={block.y}
                  zoom={zoom}
                  onRemove={handleRemoveBlock}
                  onPositionChange={handleBlockPositionChange}
                  onToggleMinimize={handleToggleMinimize}
                  isMinimized={block.isMinimized}
                  velocity={block.velocity || 0}
                  acceleration={block.acceleration || 0}
                />
              );
            }
            if (block.type === 'drone-starter') {
              return (
                <WorkspaceDroneStarter
                  key={block.id}
                  id={block.id}
                  initialX={block.x}
                  initialY={block.y}
                  zoom={zoom}
                  onRemove={handleRemoveBlock}
                  onPositionChange={handleBlockPositionChange}
                  onToggleMinimize={handleToggleMinimize}
                  isMinimized={block.isMinimized}
                />
              );
            }
            if (block.type === 'log') {
              return (
                <WorkspaceLog
                  key={block.id}
                  id={block.id}
                  initialX={block.x}
                  initialY={block.y}
                  zoom={zoom}
                  onRemove={handleRemoveBlock}
                  onPositionChange={handleBlockPositionChange}
                  onToggleMinimize={handleToggleMinimize}
                  isMinimized={block.isMinimized}
                />
              );
            }
            if (block.type === 'controller') {
              return (
                <ControllerBlock
                  key={block.id}
                  id={block.id}
                  initialX={block.x}
                  initialY={block.y}
                  zoom={zoom}
                  onRemove={handleRemoveBlock}
                  onPositionChange={handleBlockPositionChange}
                  onToggleMinimize={handleToggleMinimize}
                  isMinimized={block.isMinimized}
                />
              );
            }
            return null;
          })}
        </div>
        <Minimap
          isVisible={true}
          canvasWidth={mainRef.current?.clientWidth || 1920}
          canvasHeight={mainRef.current?.clientHeight || 1080}
          viewportWidth={mainRef.current?.clientWidth || 1920}
          viewportHeight={mainRef.current?.clientHeight || 1080}
          zoom={zoom}
          pan={pan}
          onPanChange={handleMinimapPan}
          blocks={blocks}
        />
        <DigitalClock onReset={handleResetView} />
        <DroneStatus />
      </main>
    </div>
  );
}
