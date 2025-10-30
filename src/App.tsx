import { useState, useRef, useEffect, useCallback, type DragEvent, type MouseEvent as ReactMouseEvent } from 'react';
import Header, { type ServerStatus } from './components/Header';
import Dashboard from './components/Dashboard';
import DigitalClock from './components/DigitalClock';
import DroneStatus from './components/DroneStatus';
import WorkspaceBlock from './components/WorkspaceBlock';
import WorkspaceDroneStarter from './components/WorkspaceDroneStarter';
import ControllerBlock from './components/ControllerBlock';
import WorkspaceLog from './components/WorkspaceLog';
import Minimap from './components/Minimap';
import MapView from './components/MapView';
import PlanTools from './components/PlanTools';
import { doRectanglesIntersect, calculateAnchorPoint } from './utils/selectionUtils';
import './App.css';

interface DroppedBlock {
  id: string;
  type: 'flight-state-info' | 'drone-starter' | 'controller' | 'log';
  x: number;
  y: number;
  isMinimized?: boolean;
  nodeId?: string;
  droneName?: string;
}

interface NodeGroup {
  id: string;
  droneName: string;
  blockIds: string[];
  x: number;
  y: number;
}

interface Edge {
  id: string;
  fromId: string;
  toId: string;
  anchorA: { x: number; y: number };
  anchorB: { x: number; y: number };
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
  const [activeTab, setActiveTab] = useState<'plan' | 'map'>('plan');
  const [blocks, setBlocks] = useState<DroppedBlock[]>(() => {
    const saved = localStorage.getItem('workspace-blocks');
    return saved ? JSON.parse(saved) : [];
  });

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mainRef = useRef<HTMLDivElement>(null);

  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeEnd, setMarqueeEnd] = useState({ x: 0, y: 0 });
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [nodes, setNodes] = useState<NodeGroup[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeCounter, setNodeCounter] = useState(1);

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

  const handleMouseDown = (e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-panel, .digital-clock, .workspace-block, .controller-block, .workspace-drone-starter, .workspace-log, .plan-tools')) {
      return;
    }

    if (isDragSelecting && mainRef.current) {
      const rect = mainRef.current.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;
      setMarqueeStart({ x: startX, y: startY });
      setMarqueeEnd({ x: startX, y: startY });
      console.log('MARQUEE_START', { client: [e.clientX, e.clientY], local: [startX, startY] });
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  useEffect(() => {
    if (!isDragging && !isDragSelecting) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!mainRef.current) return;

      if (isDragSelecting) {
        e.preventDefault();
        e.stopPropagation();
        const rect = mainRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        setMarqueeEnd({ x: currentX, y: currentY });
      } else if (isDragging) {
        setPan(clampPan(e.clientX - dragStart.x, e.clientY - dragStart.y, zoom));
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragSelecting) {
        finishMarqueeSelection();
      }
      setIsDragging(false);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDragSelecting) {
        console.log('MARQUEE_CANCEL');
        setIsDragSelecting(false);
        setMarqueeStart({ x: 0, y: 0 });
        setMarqueeEnd({ x: 0, y: 0 });
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDragging, isDragSelecting, dragStart, zoom, clampPan, marqueeStart, marqueeEnd]);

  const finishMarqueeSelection = () => {
    if (!mainRef.current) return;

    const rect = mainRef.current.getBoundingClientRect();
    const marqueeRect = {
      left: Math.min(marqueeStart.x, marqueeEnd.x),
      top: Math.min(marqueeStart.y, marqueeEnd.y),
      right: Math.max(marqueeStart.x, marqueeEnd.x),
      bottom: Math.max(marqueeStart.y, marqueeEnd.y)
    };

    const selected: string[] = [];
    const viewportCenterX = rect.width / 2;
    const viewportCenterY = rect.height / 2;

    blocks.forEach(block => {
      const dims = getBlockDimensions(block.type);
      const screenX = (block.x * zoom) + viewportCenterX + pan.x;
      const screenY = (block.y * zoom) + viewportCenterY + pan.y;
      const blockRect = {
        left: screenX,
        top: screenY,
        right: screenX + dims.width * zoom,
        bottom: screenY + dims.height * zoom
      };

      if (doRectanglesIntersect(marqueeRect, blockRect)) {
        selected.push(block.id);
      }
    });

    console.log('MARQUEE_END', { selectedIds: selected, count: selected.length });
    setSelectedBlockIds(selected);
    setIsDragSelecting(false);
    setMarqueeStart({ x: 0, y: 0 });
    setMarqueeEnd({ x: 0, y: 0 });
  };

  const handleDragSelectStart = () => {
    setIsDragSelecting(true);
    setSelectedBlockIds([]);
  };

  const handleMakeNode = () => {
    if (selectedBlockIds.length === 0) return;

    const selectedBlocks = blocks.filter(b => selectedBlockIds.includes(b.id));
    const starterBlock = selectedBlocks.find(b => b.type === 'drone-starter');
    const droneName = starterBlock?.droneName || 'Unnamed';

    const nodeId = `node-${nodeCounter}`;
    setNodeCounter(prev => prev + 1);

    const sortedBlocks = [...selectedBlocks].sort((a, b) => {
      if (Math.abs(a.x - b.x) < 50) return a.y - b.y;
      return a.x - b.x;
    });

    const newEdges: Edge[] = [];
    for (let i = 0; i < sortedBlocks.length - 1; i++) {
      const fromBlock = sortedBlocks[i];
      const toBlock = sortedBlocks[i + 1];
      const fromDims = getBlockDimensions(fromBlock.type);
      const toDims = getBlockDimensions(toBlock.type);

      const fromRect = { x: fromBlock.x, y: fromBlock.y, width: fromDims.width, height: fromDims.height };
      const toRect = { x: toBlock.x, y: toBlock.y, width: toDims.width, height: toDims.height };

      const anchorA = calculateAnchorPoint(fromRect, toRect, true);
      const anchorB = calculateAnchorPoint(fromRect, toRect, false);

      const edge: Edge = {
        id: `edge-${fromBlock.id}-${toBlock.id}`,
        fromId: fromBlock.id,
        toId: toBlock.id,
        anchorA,
        anchorB
      };
      newEdges.push(edge);
      console.log('EDGE', { fromId: fromBlock.id, toId: toBlock.id, anchorA, anchorB, orderIndex: i });
    }

    setEdges(prev => [...prev, ...newEdges]);

    setBlocks(prev => prev.map(b =>
      selectedBlockIds.includes(b.id) ? { ...b, nodeId, droneName } : b
    ));

    const minX = Math.min(...selectedBlocks.map(b => b.x));
    const minY = Math.min(...selectedBlocks.map(b => b.y));

    const newNode: NodeGroup = {
      id: nodeId,
      droneName,
      blockIds: selectedBlockIds,
      x: minX,
      y: minY
    };
    setNodes(prev => [...prev, newNode]);

    console.log('MAKE_NODE', { nodeId, selectedIds: selectedBlockIds, droneName });
    setSelectedBlockIds([]);
  };

  const handleUngroupNode = () => {
    const selectedNodes = nodes.filter(node =>
      node.blockIds.some(id => selectedBlockIds.includes(id))
    );

    if (selectedNodes.length === 0) return;

    selectedNodes.forEach(node => {
      setBlocks(prev => prev.map(b =>
        node.blockIds.includes(b.id) ? { ...b, nodeId: undefined, droneName: undefined } : b
      ));

      setEdges(prev => prev.filter(e =>
        !node.blockIds.includes(e.fromId) && !node.blockIds.includes(e.toId)
      ));
    });

    setNodes(prev => prev.filter(n => !selectedNodes.includes(n)));
    setSelectedBlockIds([]);
  };

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

  const handleDroneNameUpdate = (id: string, droneName: string) => {
    setBlocks(prev => prev.map(block =>
      block.id === id && block.type === 'drone-starter' ? { ...block, droneName } : block
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

  useEffect(() => {
    if (activeTab === 'plan') {
      console.log('PLAN_ROOT OK');
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'map' && isDashboardOpen) {
      setIsDashboardOpen(false);
    }
  }, [activeTab]);

  return (
    <div className="gcs-app">
      <Header
        serverStatus={serverStatus}
        onLogoClick={() => setIsDashboardOpen(!isDashboardOpen)}
      />
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('plan')}
        >
          Plan
        </button>
        <button
          className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          Map
        </button>
      </div>
      <main
        ref={mainRef}
        className="gcs-main"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="plan-scope" style={{ display: activeTab === 'plan' ? 'block' : 'none' }}>
          <div
            className="main-background"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: 'center center'
            }}
          />
          {isDragSelecting && marqueeStart.x !== 0 && (
            <div
              className="marquee-selection"
              style={{
                position: 'absolute',
                left: `${Math.min(marqueeStart.x, marqueeEnd.x)}px`,
                top: `${Math.min(marqueeStart.y, marqueeEnd.y)}px`,
                width: `${Math.abs(marqueeEnd.x - marqueeStart.x)}px`,
                height: `${Math.abs(marqueeEnd.y - marqueeStart.y)}px`,
                border: '2px dashed #00d4ff',
                background: 'rgba(0, 212, 255, 0.1)',
                pointerEvents: 'none',
                zIndex: 9999
              }}
            />
          )}
          <svg
            className="edges-layer"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            {edges.map(edge => {
              const fromBlock = blocks.find(b => b.id === edge.fromId);
              const toBlock = blocks.find(b => b.id === edge.toId);
              if (!fromBlock || !toBlock || !mainRef.current) return null;

              const rect = mainRef.current.getBoundingClientRect();
              const viewportCenterX = rect.width / 2;
              const viewportCenterY = rect.height / 2;

              const x1 = (edge.anchorA.x * zoom) + viewportCenterX + pan.x;
              const y1 = (edge.anchorA.y * zoom) + viewportCenterY + pan.y;
              const x2 = (edge.anchorB.x * zoom) + viewportCenterX + pan.x;
              const y2 = (edge.anchorB.y * zoom) + viewportCenterY + pan.y;

              return (
                <line
                  key={edge.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#00d4ff"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              );
            })}
          </svg>
          <div
            className="workspace-blocks-container"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              zIndex: 2
            }}
          >
          {blocks.map(block => {
            const isSelected = selectedBlockIds.includes(block.id);
            const highlightStyle = isSelected ? {
              boxShadow: '0 0 0 3px #00d4ff',
              border: '2px solid #00d4ff'
            } : {};
            if (block.type === 'drone-starter') {
              return (
                <div key={block.id} style={highlightStyle}>
                  <WorkspaceDroneStarter
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
                    droneName={block.droneName}
                    onDroneNameUpdate={handleDroneNameUpdate}
                  />
                </div>
              );
            } else if (block.type === 'controller') {
              return (
                <div key={block.id} style={highlightStyle}>
                  <ControllerBlock
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
                    droneName={block.droneName}
                  />
                </div>
              );
            } else if (block.type === 'log') {
              return (
                <div key={block.id} style={highlightStyle}>
                  <WorkspaceLog
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
                    droneName={block.droneName}
                  />
                </div>
              );
            } else {
              return (
                <div key={block.id} style={highlightStyle}>
                  <WorkspaceBlock
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
                    droneName={block.droneName}
                  />
                </div>
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
          <PlanTools
            onDragSelectStart={handleDragSelectStart}
            onMakeNode={handleMakeNode}
            onUngroupNode={handleUngroupNode}
            canMakeNode={selectedBlockIds.length >= 1}
            canUngroup={nodes.some(n => n.blockIds.some(id => selectedBlockIds.includes(id)))}
          />
          <DigitalClock onReset={handleResetView} />
          <DroneStatus />
        </div>
        {activeTab === 'map' && <MapView />}
      </main>
    </div>
  );
}

export default App;
