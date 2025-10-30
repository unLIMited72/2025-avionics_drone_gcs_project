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
import MapView from './components/MapView';
import type { PlanState, PlanEdge, PlanNode } from './types/plan';
import { rectsIntersect, getMarqueeRect, calculateEdgeAnchors, type Rect } from './utils/planGeometry';
import './App.css';

interface DroppedBlock {
  id: string;
  type: 'flight-state-info' | 'drone-starter' | 'controller' | 'log';
  x: number;
  y: number;
  isMinimized?: boolean;
  droneName?: string;
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

  const [planState, setPlanState] = useState<PlanState>({
    selection: { panelIds: [] },
    nodes: [],
    edges: [],
    dragSelectMode: false
  });

  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const marqueePointerIdRef = useRef<number | null>(null);

  const CANVAS_WIDTH = 4000;
  const CANVAS_HEIGHT = 3000;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;
  const ZOOM_SPEED = 0.1;

  const toWorldCoords = useCallback((clientX: number, clientY: number) => {
    if (!mainRef.current) return { x: 0, y: 0 };
    const rect = mainRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const worldX = (localX - pan.x) / zoom;
    const worldY = (localY - pan.y) / zoom;
    return { x: worldX, y: worldY };
  }, [pan, zoom]);

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
    if (planState.dragSelectMode || isMarqueeActive) return;
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
  }, [zoom, pan, clampPan, planState.dragSelectMode, isMarqueeActive]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-panel, .digital-clock, .workspace-block, .controller-block, .workspace-drone-starter, .workspace-log, .gear-menu-container')) {
      return;
    }

    if (planState.dragSelectMode) {
      e.preventDefault();
      e.stopPropagation();
      const world = toWorldCoords(e.clientX, e.clientY);
      setMarqueeStart(world);
      setMarqueeEnd(world);
      setIsMarqueeActive(true);
      if (e.currentTarget instanceof Element && e.nativeEvent instanceof window.PointerEvent) {
        (e.currentTarget as HTMLElement).setPointerCapture(e.nativeEvent.pointerId);
        marqueePointerIdRef.current = e.nativeEvent.pointerId;
      }
      console.log('MARQUEE_START', {
        client: [e.clientX, e.clientY],
        local: [e.clientX - mainRef.current!.getBoundingClientRect().left, e.clientY - mainRef.current!.getBoundingClientRect().top],
        world: [world.x, world.y],
        pan,
        scale: zoom
      });
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMarqueeActive && marqueeStart) {
      e.preventDefault();
      e.stopPropagation();
      const world = toWorldCoords(e.clientX, e.clientY);
      setMarqueeEnd(world);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isMarqueeActive && marqueeStart && marqueeEnd) {
      e.preventDefault();
      e.stopPropagation();

      if (marqueePointerIdRef.current !== null && e.currentTarget instanceof Element) {
        (e.currentTarget as HTMLElement).releasePointerCapture(marqueePointerIdRef.current);
        marqueePointerIdRef.current = null;
      }

      const marqueeRect = getMarqueeRect(marqueeStart, marqueeEnd);
      const selectedIds: string[] = [];

      blocks.forEach(block => {
        const dim = getBlockDimensions(block.type);
        const blockRect: Rect = {
          x: block.x,
          y: block.y,
          width: dim.width,
          height: dim.height
        };

        const intersects = rectsIntersect(marqueeRect, blockRect);
        console.log('MARQUEE_HIT', {
          id: block.id,
          role: block.type,
          bboxWorld: blockRect,
          intersects
        });

        if (intersects) {
          selectedIds.push(block.id);
        }
      });

      setPlanState(prev => ({
        ...prev,
        selection: { panelIds: selectedIds },
        dragSelectMode: false
      }));

      setMarqueeStart(null);
      setMarqueeEnd(null);
      setIsMarqueeActive(false);
      return;
    }
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

  useEffect(() => {
    if (!isMarqueeActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMarqueeStart(null);
        setMarqueeEnd(null);
        setIsMarqueeActive(false);
        setPlanState(prev => ({ ...prev, dragSelectMode: false }));
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMarqueeActive]);

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
    setPlanState(prev => ({
      ...prev,
      selection: { panelIds: prev.selection.panelIds.filter(pid => pid !== id) }
    }));
  };

  const handleToggleMinimize = (id: string) => {
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, isMinimized: !block.isMinimized } : block
    ));
  };

  const handleDragSelectClick = () => {
    setPlanState(prev => ({ ...prev, dragSelectMode: true }));
  };

  const handleMakeNodeClick = () => {
    const selectedBlocks = blocks.filter(b => planState.selection.panelIds.includes(b.id));
    if (selectedBlocks.length === 0) return;

    const sortedBlocks = [...selectedBlocks].sort((a, b) => {
      if (Math.abs(a.x - b.x) > 10) return a.x - b.x;
      return a.y - b.y;
    });

    const droneStarter = selectedBlocks.find(b => b.type === 'drone-starter');
    const droneName = droneStarter?.droneName || 'Unnamed';

    const nodeId = `node-${Date.now()}`;
    const minX = Math.min(...selectedBlocks.map(b => b.x));
    const minY = Math.min(...selectedBlocks.map(b => b.y));
    const maxX = Math.max(...selectedBlocks.map(b => b.x + getBlockDimensions(b.type).width));
    const maxY = Math.max(...selectedBlocks.map(b => b.y + getBlockDimensions(b.type).height));

    const newNode: PlanNode = {
      id: nodeId,
      droneName,
      panelIds: selectedBlocks.map(b => b.id),
      x: minX - 20,
      y: minY - 50,
      width: maxX - minX + 40,
      height: maxY - minY + 70
    };

    const newEdges: PlanEdge[] = [];
    for (let i = 0; i < sortedBlocks.length - 1; i++) {
      const fromBlock = sortedBlocks[i];
      const toBlock = sortedBlocks[i + 1];

      const fromDim = getBlockDimensions(fromBlock.type);
      const toDim = getBlockDimensions(toBlock.type);

      const rectA: Rect = { x: fromBlock.x, y: fromBlock.y, width: fromDim.width, height: fromDim.height };
      const rectB: Rect = { x: toBlock.x, y: toBlock.y, width: toDim.width, height: toDim.height };

      const { anchorA, anchorB } = calculateEdgeAnchors(rectA, rectB);

      const edge: PlanEdge = {
        id: `edge-${Date.now()}-${i}`,
        fromId: fromBlock.id,
        toId: toBlock.id,
        anchorA,
        anchorB,
        orderIndex: i
      };

      console.log('EDGE', {
        fromId: fromBlock.id,
        toId: toBlock.id,
        anchorA,
        anchorB,
        orderIndex: i
      });

      newEdges.push(edge);
    }

    console.log('MAKE_NODE', {
      selectedIds: selectedBlocks.map(b => b.id),
      droneName,
      nodeId
    });

    setPlanState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      edges: [...prev.edges, ...newEdges],
      selection: { panelIds: [] }
    }));

    setBlocks(prev => prev.map(b =>
      selectedBlocks.find(sb => sb.id === b.id)
        ? { ...b, droneName }
        : b
    ));
  };

  const handleUngroupClick = () => {
    const selectedNodes = planState.nodes.filter(n =>
      n.panelIds.some(pid => planState.selection.panelIds.includes(pid))
    );

    if (selectedNodes.length === 0) return;

    const nodeIdsToRemove = new Set(selectedNodes.map(n => n.id));
    const panelIdsInNodes = new Set(selectedNodes.flatMap(n => n.panelIds));

    setPlanState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => !nodeIdsToRemove.has(n.id)),
      edges: prev.edges.filter(e => !panelIdsInNodes.has(e.fromId) && !panelIdsInNodes.has(e.toId)),
      selection: { panelIds: [] }
    }));

    setBlocks(prev => prev.map(b =>
      panelIdsInNodes.has(b.id)
        ? { ...b, droneName: undefined }
        : b
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
      if (planState.dragSelectMode) {
        mainElement.style.cursor = 'crosshair';
      } else if (isDragging) {
        mainElement.style.cursor = 'grabbing';
      } else {
        mainElement.style.cursor = 'grab';
      }
    }
  }, [isDragging, planState.dragSelectMode]);

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

  const canMakeNode = planState.selection.panelIds.length >= 1;
  const canUngroup = planState.nodes.some(n =>
    n.panelIds.some(pid => planState.selection.panelIds.includes(pid))
  );

  const marqueeRect = marqueeStart && marqueeEnd ? getMarqueeRect(marqueeStart, marqueeEnd) : null;

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
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
          <div
            className="workspace-blocks-container"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
            }}
          >
            {planState.edges.map(edge => {
              const fromBlock = blocks.find(b => b.id === edge.fromId);
              const toBlock = blocks.find(b => b.id === edge.toId);
              if (!fromBlock || !toBlock) return null;

              return (
                <svg
                  key={edge.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                >
                  <line
                    x1={edge.anchorA.x}
                    y1={edge.anchorA.y}
                    x2={edge.anchorB.x}
                    y2={edge.anchorB.y}
                    stroke="rgba(0, 212, 255, 0.6)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    strokeLinecap="round"
                  />
                </svg>
              );
            })}

            {planState.nodes.map(node => (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${node.width}px`,
                  height: `${node.height}px`,
                  border: '2px solid rgba(0, 255, 136, 0.5)',
                  borderRadius: '8px',
                  background: 'rgba(0, 255, 136, 0.05)',
                  pointerEvents: 'none',
                  zIndex: 0
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '8px',
                  padding: '4px 12px',
                  background: 'rgba(0, 255, 136, 0.2)',
                  border: '1px solid rgba(0, 255, 136, 0.5)',
                  borderRadius: '4px',
                  color: '#00ff88',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  Node #{planState.nodes.indexOf(node) + 1} — {node.droneName}
                </div>
              </div>
            ))}

            {blocks.map(block => {
              const isSelected = planState.selection.panelIds.includes(block.id);

              const WrapperComponent = ({ children }: { children: React.ReactNode }) => (
                <div style={{ position: 'relative' }}>
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      inset: '-4px',
                      border: '3px solid rgba(0, 212, 255, 0.8)',
                      borderRadius: '10px',
                      background: 'rgba(0, 212, 255, 0.1)',
                      pointerEvents: 'none',
                      zIndex: 5
                    }} />
                  )}
                  {children}
                </div>
              );

              if (block.type === 'drone-starter') {
                return (
                  <WrapperComponent key={block.id}>
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
                    />
                  </WrapperComponent>
                );
              } else if (block.type === 'controller') {
                return (
                  <WrapperComponent key={block.id}>
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
                    />
                  </WrapperComponent>
                );
              } else if (block.type === 'log') {
                return (
                  <WrapperComponent key={block.id}>
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
                    />
                  </WrapperComponent>
                );
              } else {
                return (
                  <WrapperComponent key={block.id}>
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
                    />
                  </WrapperComponent>
                );
              }
            })}

            {marqueeRect && (
              <div
                style={{
                  position: 'absolute',
                  left: `${marqueeRect.x}px`,
                  top: `${marqueeRect.y}px`,
                  width: `${marqueeRect.width}px`,
                  height: `${marqueeRect.height}px`,
                  border: '2px dashed rgba(0, 212, 255, 0.8)',
                  background: 'rgba(0, 212, 255, 0.1)',
                  pointerEvents: 'none',
                  zIndex: 100
                }}
              />
            )}
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
          <DigitalClock
            onReset={handleResetView}
            gearMenuProps={{
              canMakeNode,
              canUngroup,
              onDragSelectClick: handleDragSelectClick,
              onMakeNodeClick: handleMakeNodeClick,
              onUngroupClick: handleUngroupClick
            }}
          />
          <DroneStatus />
        </div>
        {activeTab === 'map' && <MapView />}
      </main>
    </div>
  );
}

export default App;
