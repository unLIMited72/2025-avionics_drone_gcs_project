import { useState, useRef, useEffect, useCallback, type DragEvent } from 'react';
import Header, { type ServerStatus } from './components/Header';
import Dashboard from './components/Dashboard';
import DigitalClock from './components/DigitalClock';
import DroneStatus from './components/DroneStatus';
import WorkspaceBlock from './components/WorkspaceBlock';
import WorkspaceDroneStarter from './components/WorkspaceDroneStarter';
import ControllerBlock from './components/ControllerBlock';
import WorkspaceLog from './components/WorkspaceLog';
import Minimap from './components/Minimap';
import './App.css';

interface DroppedBlock {
  id: string;
  type: 'flight-state-info' | 'drone-starter' | 'controller' | 'log';
  x: number;
  y: number;
  isMinimized?: boolean;
}

function getBlockDimensions(type: string): { width: number; height: number } {
  switch (type) {
    case 'log':
      return { width: 520, height: 450 };
    case 'controller':
      return { width: 320, height: 400 };
    case 'drone-starter':
      return { width: 280, height: 380 };
    case 'flight-state-info':
      return { width: 560, height: 380 };
    default:
      return { width: 300, height: 300 };
  }
}

function App() {
  const [serverStatus] = useState<ServerStatus>('disconnected');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [blocks, setBlocks] = useState<DroppedBlock[]>(() => {
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

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const blockType = e.dataTransfer.getData('blockType');

    if (!blockType || !mainRef.current) {
      return;
    }

    const rect = mainRef.current.getBoundingClientRect();
    const viewportCenterX = rect.width / 2;
    const viewportCenterY = rect.height / 2;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const canvasX = (clientX - viewportCenterX) / zoom - pan.x;
    const canvasY = (clientY - viewportCenterY) / zoom - pan.y;

    const dimensions = getBlockDimensions(blockType);
    const x = canvasX - dimensions.width / 2;
    const y = canvasY - dimensions.height / 2;

    if (!isFinite(x) || !isFinite(y)) {
      console.error('Invalid drop coordinates:', { x, y, clientX, clientY, zoom, pan });
      return;
    }

    const newBlock: DroppedBlock = {
      id: `block-${Date.now()}`,
      type: blockType as 'flight-state-info' | 'drone-starter' | 'controller' | 'log',
      x,
      y
    };

    setBlocks(prev => [...prev, newBlock]);
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };

  const handleToggleMinimize = (id: string) => {
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, isMinimized: !block.isMinimized } : block
    ));
  };

  const handleMinimapPan = useCallback((x: number, y: number) => {
    setPan(clampPan(x, y, zoom));
  }, [zoom, clampPan]);

  useEffect(() => {
    localStorage.setItem('workspace-blocks', JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.style.cursor = isDragging ? 'grabbing' : 'grab';
    }
  }, [isDragging]);

  return (
    <div className="gcs-app">
      <Header
        serverStatus={serverStatus}
        onLogoClick={() => setIsDashboardOpen(!isDashboardOpen)}
      />
      <main
        ref={mainRef}
        className="gcs-main"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div
          className="main-background"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center'
          }}
        />
        <div
          className="workspace-blocks-container"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
          }}
        >
          {blocks.map(block => {
            if (block.type === 'drone-starter') {
              return (
                <WorkspaceDroneStarter
                  key={block.id}
                  id={block.id}
                  initialX={block.x}
                  initialY={block.y}
                  zoom={zoom}
                  onRemove={handleRemoveBlock}
                  onPositionChange={(id, newX, newY) => {
                    setBlocks(prev => prev.map(b =>
                      b.id === id ? { ...b, x: newX, y: newY } : b
                    ));
                  }}
                  onToggleMinimize={handleToggleMinimize}
                  isMinimized={block.isMinimized || false}
                />
              );
            } else if (block.type === 'controller') {
              return (
                <ControllerBlock
                  key={block.id}
                  id={block.id}
                  initialX={block.x}
                  initialY={block.y}
                  zoom={zoom}
                  onRemove={handleRemoveBlock}
                  onPositionChange={(id, newX, newY) => {
                    setBlocks(prev => prev.map(b =>
                      b.id === id ? { ...b, x: newX, y: newY } : b
                    ));
                  }}
                  onToggleMinimize={handleToggleMinimize}
                  isMinimized={block.isMinimized || false}
                />
              );
            } else if (block.type === 'log') {
              return (
                <WorkspaceLog
                  key={block.id}
                  id={block.id}
                  initialX={block.x}
                  initialY={block.y}
                  zoom={zoom}
                  onRemove={handleRemoveBlock}
                  onPositionChange={(id, newX, newY) => {
                    setBlocks(prev => prev.map(b =>
                      b.id === id ? { ...b, x: newX, y: newY } : b
                    ));
                  }}
                  onToggleMinimize={handleToggleMinimize}
                  isMinimized={block.isMinimized || false}
                />
              );
            } else {
              return (
                <WorkspaceBlock
                  key={block.id}
                  id={block.id}
                  initialX={block.x}
                  initialY={block.y}
                  zoom={zoom}
                  onRemove={handleRemoveBlock}
                  onPositionChange={(id, newX, newY) => {
                    setBlocks(prev => prev.map(b =>
                      b.id === id ? { ...b, x: newX, y: newY } : b
                    ));
                  }}
                  onToggleMinimize={handleToggleMinimize}
                  isMinimized={block.isMinimized || false}
                  velocity={15.2}
                  acceleration={2.3}
                />
              );
            }
          })}
        </div>
        <Dashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />
        <Minimap
          isVisible={!isDashboardOpen}
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

export default App;
