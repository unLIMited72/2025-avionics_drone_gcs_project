import { useState, useRef, useEffect, type DragEvent } from 'react';
import Header, { type ServerStatus } from './components/Header';
import Dashboard from './components/Dashboard';
import DigitalClock from './components/DigitalClock';
import DroneStatus from './components/DroneStatus';
import WorkspaceBlock from './components/WorkspaceBlock';
import WorkspaceDroneStarter from './components/WorkspaceDroneStarter';
import ControllerBlock from './components/ControllerBlock';
import WorkspaceLog from './components/WorkspaceLog';
import './App.css';

interface DroppedBlock {
  id: string;
  type: 'flight-state-info' | 'drone-starter' | 'controller' | 'log';
  x: number;
  y: number;
}

function App() {
  const [serverStatus] = useState<ServerStatus>('disconnected');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [blocks, setBlocks] = useState<DroppedBlock[]>([]);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mainRef = useRef<HTMLDivElement>(null);


  const handleWheel = (e: React.WheelEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-panel, .clock-controls')) {
      return;
    }

    e.preventDefault();

    if (!mainRef.current) return;

    const rect = mainRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const worldX = (mouseX - centerX - pan.x) / zoom;
    const worldY = (mouseY - centerY - pan.y) / zoom;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(0.5, zoom * delta), 2);

    const newPanX = mouseX - centerX - worldX * newZoom;
    const newPanY = mouseY - centerY - worldY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-panel, .digital-clock, .workspace-block, .controller-block, .workspace-drone-starter, .workspace-log')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      if (isDragging && mainRef.current) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        const viewportWidth = mainRef.current.clientWidth;
        const viewportHeight = mainRef.current.clientHeight;

        const scaledGridWidth = (viewportWidth * 3) * zoom;
        const scaledGridHeight = (viewportHeight * 3) * zoom;

        const maxPanX = Math.max(0, (scaledGridWidth - viewportWidth) / (2 * zoom));
        const maxPanY = Math.max(0, (scaledGridHeight - viewportHeight) / (2 * zoom));

        setPan({
          x: Math.min(Math.max(newX, -maxPanX), maxPanX),
          y: Math.min(Math.max(newY, -maxPanY), maxPanY)
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, zoom]);

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
    const blockType = e.dataTransfer.getData('blockType');

    if (blockType && mainRef.current) {
      const rect = mainRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const dropX = e.clientX - rect.left;
      const dropY = e.clientY - rect.top;

      const x = (dropX - centerX - pan.x) / zoom;
      const y = (dropY - centerY - pan.y) / zoom;

      const newBlock: DroppedBlock = {
        id: `block-${Date.now()}`,
        type: blockType as 'flight-state-info' | 'drone-starter' | 'controller' | 'log',
        x,
        y
      };

      setBlocks(prev => [...prev, newBlock]);
    }
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };

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
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center'
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
                  velocity={15.2}
                  acceleration={2.3}
                />
              );
            }
          })}
        </div>
        <Dashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />
        <DigitalClock onReset={handleResetView} />
        <DroneStatus />
      </main>
    </div>
  );
}

export default App;
