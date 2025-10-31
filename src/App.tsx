import { useState, useRef, useEffect, useCallback, type DragEvent, type ComponentType } from 'react';
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
import './App.css';

interface DroppedBlock {
  id: string;
  type: 'flight-state-info' | 'drone-starter' | 'controller' | 'log';
  x: number;
  y: number;
  isMinimized?: boolean;
  nodeId?: string;
  isHighlighted?: boolean;
}

interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface Node {
  id: string;
  childIds: string[];
  name: string;
}

interface BaseBlockProps {
  id: string;
  initialX: number;
  initialY: number;
  zoom: number;
  onRemove: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onToggleMinimize: (id: string) => void;
  isMinimized: boolean;
  nodeName?: string;
  isHighlighted?: boolean;
}

interface FlightBlockProps extends BaseBlockProps {
  velocity: number;
  acceleration: number;
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

const CANVAS_WIDTH = 4000;
const CANVAS_HEIGHT = 3000;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_SPEED = 0.1;

const BLOCK_COMPONENT_MAP: Record<string, ComponentType<BaseBlockProps | FlightBlockProps>> = {
  'drone-starter': WorkspaceDroneStarter,
  'controller': ControllerBlock,
  'log': WorkspaceLog,
  'flight-state-info': WorkspaceBlock as ComponentType<BaseBlockProps | FlightBlockProps>
};

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

  const [isDragSelectMode, setIsDragSelectMode] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [nodeDragStart, setNodeDragStart] = useState({ x: 0, y: 0 });

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

    const offsetX = clientX - rect.left - centerX;
    const offsetY = clientY - rect.top - centerY;

    const worldX = (offsetX - pan.x) / zoom;
    const worldY = (offsetY - pan.y) / zoom;

    return { x: worldX, y: worldY };
  }, [pan, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-panel, .digital-clock, .workspace-block, .controller-block, .workspace-drone-starter, .workspace-log')) {
      return;
    }

    if (isDragSelectMode) {
      const worldPos = clientToWorld(e.clientX, e.clientY);
      setIsSelecting(true);
      setSelectionRect({
        startX: worldPos.x,
        startY: worldPos.y,
        endX: worldPos.x,
        endY: worldPos.y
      });
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  useEffect(() => {
    if (isSelecting) {
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
          checkIntersections();
        }
        setIsDragSelectMode(false);
        setTimeout(() => setSelectionRect(null), 100);
      };

      document.addEventListener('mousemove', handleSelectMouseMove);
      document.addEventListener('mouseup', handleSelectMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleSelectMouseMove);
        document.removeEventListener('mouseup', handleSelectMouseUp);
      };
    }
  }, [isSelecting, selectionRect, clientToWorld]);

  useEffect(() => {
    if (isDraggingNode && activeNodeId) {
      const handleNodeDragMove = (e: MouseEvent) => {
        const dx = (e.clientX - nodeDragStart.x) / zoom;
        const dy = (e.clientY - nodeDragStart.y) / zoom;

        const node = nodes.find(n => n.id === activeNodeId);
        if (!node) return;

        setBlocks(prevBlocks => prevBlocks.map(block => {
          if (node.childIds.includes(block.id)) {
            return { ...block, x: block.x + dx, y: block.y + dy };
          }
          return block;
        }));

        setNodeDragStart({ x: e.clientX, y: e.clientY });
      };

      const handleNodeDragUp = () => {
        setIsDraggingNode(false);
      };

      document.addEventListener('mousemove', handleNodeDragMove);
      document.addEventListener('mouseup', handleNodeDragUp);

      return () => {
        document.removeEventListener('mousemove', handleNodeDragMove);
        document.removeEventListener('mouseup', handleNodeDragUp);
      };
    }
  }, [isDraggingNode, activeNodeId, nodeDragStart, nodes, zoom]);

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

  const checkIntersections = useCallback(() => {
    if (!selectionRect) return;

    const selMinX = Math.min(selectionRect.startX, selectionRect.endX);
    const selMaxX = Math.max(selectionRect.startX, selectionRect.endX);
    const selMinY = Math.min(selectionRect.startY, selectionRect.endY);
    const selMaxY = Math.max(selectionRect.startY, selectionRect.endY);

    setBlocks(prevBlocks => prevBlocks.map(block => {
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
  }, [selectionRect]);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragSelectMode(false);
    setIsSelecting(false);
    setSelectionRect(null);
    setNodes([]);
    setActiveNodeId(null);
    setBlocks(prevBlocks => prevBlocks.map(block => ({
      ...block,
      isHighlighted: false,
      nodeId: undefined
    })));
  }, []);

  const handleToggleDragSelect = useCallback(() => {
    setIsDragSelectMode(prev => !prev);
    if (isSelecting) {
      setIsSelecting(false);
    }
  }, [isSelecting]);

  const handleCreateNode = useCallback(() => {
    let targetBlocks: DroppedBlock[] = [];

    if (activeNodeId) {
      const node = nodes.find(n => n.id === activeNodeId);
      if (node) {
        targetBlocks = blocks.filter(b => node.childIds.includes(b.id));
      }
    } else {
      targetBlocks = blocks.filter(b => b.isHighlighted);
    }

    if (targetBlocks.length === 0) return;

    const nodeId = activeNodeId || `node-${Date.now()}`;
    const nodeName = `drone name`;

    setNodes(prev => {
      const existingNode = prev.find(n => n.id === nodeId);
      if (existingNode) {
        return prev.map(n => n.id === nodeId ? {
          ...n,
          childIds: Array.from(new Set([...n.childIds, ...targetBlocks.map(b => b.id)]))
        } : n);
      }
      return [...prev, {
        id: nodeId,
        childIds: targetBlocks.map(b => b.id),
        name: nodeName
      }];
    });

    setBlocks(prevBlocks => prevBlocks.map(block => {
      if (targetBlocks.some(tb => tb.id === block.id)) {
        return { ...block, nodeId };
      }
      return block;
    }));

    setActiveNodeId(nodeId);
  }, [blocks, nodes, activeNodeId]);

  const handleUngroupNode = useCallback(() => {
    if (!activeNodeId) return;

    const node = nodes.find(n => n.id === activeNodeId);
    if (!node || node.childIds.length === 0) return;

    setNodes(prev => prev.filter(n => n.id !== activeNodeId));
    setBlocks(prevBlocks => prevBlocks.map(block => {
      if (block.nodeId === activeNodeId) {
        return { ...block, nodeId: undefined, isHighlighted: false };
      }
      return block;
    }));

    setActiveNodeId(null);
  }, [nodes, activeNodeId]);

  const getNodeBoundingBox = useCallback((nodeId: string) => {
    const nodeBlocks = blocks.filter(b => b.nodeId === nodeId);
    if (nodeBlocks.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodeBlocks.forEach(block => {
      const dimensions = getBlockDimensions(block.type);
      minX = Math.min(minX, block.x);
      minY = Math.min(minY, block.y);
      maxX = Math.max(maxX, block.x + dimensions.width);
      maxY = Math.max(maxY, block.y + dimensions.height);
    });

    return { minX, minY, maxX, maxY };
  }, [blocks]);


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

  const handleRemoveBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  }, []);

  const handleToggleMinimize = useCallback((id: string) => {
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, isMinimized: !block.isMinimized } : block
    ));
  }, []);

  const handleBlockPositionChange = useCallback((id: string, x: number, y: number) => {
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, x, y } : b
    ));
  }, []);

  const handleMinimapPan = useCallback((x: number, y: number) => {
    setPan(clampPan(x, y, zoom));
  }, [zoom, clampPan]);

  useEffect(() => {
    localStorage.setItem('workspace-blocks', JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (mainElement) {
      if (isDragSelectMode) {
        mainElement.style.cursor = 'crosshair';
      } else if (isDragging) {
        mainElement.style.cursor = 'grabbing';
      } else {
        mainElement.style.cursor = 'grab';
      }
    }
  }, [isDragging, isDragSelectMode]);

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
          <div
            className="workspace-blocks-container"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
            }}
          >
          {nodes.map(node => {
            const bbox = getNodeBoundingBox(node.id);
            if (!bbox) return null;

            const isActive = activeNodeId === node.id;

            return (
              <div
                key={node.id}
                className={`node-bounding-box ${isActive ? 'active' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${bbox.minX}px`,
                  top: `${bbox.minY}px`,
                  width: `${bbox.maxX - bbox.minX}px`,
                  height: `${bbox.maxY - bbox.minY}px`,
                  border: `2px solid rgba(0, 212, 255, ${isActive ? 0.9 : 0.6})`,
                  borderRadius: '8px',
                  pointerEvents: 'all',
                  cursor: 'move',
                  boxShadow: `0 0 ${isActive ? 25 : 15}px rgba(0, 212, 255, ${isActive ? 0.5 : 0.3})`,
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveNodeId(node.id);
                  setIsDraggingNode(true);
                  setNodeDragStart({ x: e.clientX, y: e.clientY });
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNodeId(node.id);
                }}
              />
            );
          })}
          {blocks.map(block => {
            const BlockComponent = BLOCK_COMPONENT_MAP[block.type] || WorkspaceBlock;
            const node = nodes.find(n => n.id === block.nodeId);
            const extraProps = block.type === 'flight-state-info'
              ? { velocity: 15.2, acceleration: 2.3 }
              : {};

            return (
              <div
                key={block.id}
                className={block.isHighlighted ? 'is-highlighted' : ''}
                style={{
                  position: 'relative',
                  display: 'contents'
                }}
              >
                <BlockComponent
                  id={block.id}
                  initialX={block.x}
                  initialY={block.y}
                  zoom={zoom}
                  onRemove={handleRemoveBlock}
                  onPositionChange={handleBlockPositionChange}
                  onToggleMinimize={handleToggleMinimize}
                  isMinimized={block.isMinimized || false}
                  nodeName={node?.name}
                  isHighlighted={block.isHighlighted}
                  {...extraProps}
                />
              </div>
            );
          })}
          {selectionRect && (
            <div
              className="selection-rect"
              style={{
                position: 'absolute',
                left: `${Math.min(selectionRect.startX, selectionRect.endX)}px`,
                top: `${Math.min(selectionRect.startY, selectionRect.endY)}px`,
                width: `${Math.abs(selectionRect.endX - selectionRect.startX)}px`,
                height: `${Math.abs(selectionRect.endY - selectionRect.startY)}px`,
                border: '2px dashed rgba(0, 212, 255, 0.8)',
                background: 'rgba(0, 212, 255, 0.1)',
                pointerEvents: 'none',
                borderRadius: '4px',
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
            onDragSelect={handleToggleDragSelect}
            onCreateNode={handleCreateNode}
            onUngroupNode={handleUngroupNode}
            isDragSelectMode={isDragSelectMode}
            canCreateNode={blocks.some(b => b.isHighlighted) || activeNodeId !== null}
            canUngroup={activeNodeId !== null && (nodes.find(n => n.id === activeNodeId)?.childIds.length ?? 0) > 0}
          />
          <DroneStatus />
        </div>
        {activeTab === 'map' && <MapView />}
      </main>
    </div>
  );
}

export default App;
