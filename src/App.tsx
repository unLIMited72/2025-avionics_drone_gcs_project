import { useState, useEffect, useCallback, type DragEvent } from 'react';
import Header, { type ServerStatus } from './components/Header';
import Dashboard from './components/Dashboard';
import DigitalClock from './components/DigitalClock';
import DroneStatus from './components/DroneStatus';
import WorkspaceBlock from './components/WorkspaceBlock';
import Minimap from './components/Minimap';
import MapView from './components/MapView';
import { type DroppedBlock } from './types/workspace';
import { BLOCK_COMPONENT_MAP, getBlockDimensions } from './constants/workspace';
import { useWorkspaceZoom } from './hooks/useWorkspaceZoom';
import { useWorkspaceSelection } from './hooks/useWorkspaceSelection';
import { useWorkspaceNodes } from './hooks/useWorkspaceNodes';
import './App.css';

function App() {
  const [serverStatus] = useState<ServerStatus>('disconnected');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'map'>('plan');
  const [connectedDrones, setConnectedDrones] = useState<Set<string>>(new Set());
  const [droneName, setDroneName] = useState<string>('');

  const [blocks, setBlocks] = useState<DroppedBlock[]>(() => {
    const saved = localStorage.getItem('workspace-blocks');
    const savedBlocks: DroppedBlock[] = saved ? JSON.parse(saved) : [];

    const connected = new Set<string>();
    savedBlocks.forEach(block => {
      if (block.type === 'drone-starter' && block.isConnected && block.serialNumber) {
        connected.add(block.serialNumber);
      }
    });

    setTimeout(() => {
      setConnectedDrones(connected);
    }, 0);

    return savedBlocks;
  });

  const {
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
  } = useWorkspaceZoom();

  const {
    isDragSelectMode,
    selectionRect,
    finalRect,
    setFinalRect,
    handleToggleDragSelect,
    startSelection
  } = useWorkspaceSelection(setBlocks, clientToWorld);

  const {
    nodes,
    activeNodeId,
    isDraggingNode,
    nodeTransforms,
    setActiveNodeId,
    handleCreateNode,
    handleUngroupNode,
    getNodeBoundingBox,
    handleNodePointerDown
  } = useWorkspaceNodes(blocks, setBlocks, zoom);


  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-panel, .digital-clock, .workspace-block, .controller-block, .workspace-drone-starter, .workspace-log, .workspace-drone-pack')) {
      return;
    }

    if (isDragSelectMode) {
      const worldPos = clientToWorld(e.clientX, e.clientY);
      startSelection(worldPos.x, worldPos.y);
      setActiveNodeId(null);
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


  const handleResetView = useCallback(() => {
    resetView();
    setFinalRect(null);
    setBlocks(prevBlocks => prevBlocks.map(block => ({
      ...block,
      isHighlighted: false
    })));
  }, [resetView]);





  const handleDroneNameChange = useCallback((blockId: string, name: string) => {
    setDroneName(name);
    setBlocks(prevBlocks => prevBlocks.map(block =>
      block.id === blockId ? { ...block, droneName: name } : block
    ));
  }, []);

  const handleDroneConnectionChange = useCallback((blockId: string, serialNumber: string, isConnected: boolean) => {
    setBlocks(prevBlocks => {
      const updatedBlocks = prevBlocks.map(block =>
        block.id === blockId ? { ...block, serialNumber, isConnected } : block
      );

      const connected = new Set<string>();
      updatedBlocks.forEach(block => {
        if (block.type === 'drone-starter' && block.isConnected && block.serialNumber) {
          connected.add(block.serialNumber);
        }
      });
      setConnectedDrones(connected);

      return updatedBlocks;
    });
  }, []);


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
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const worldX = (clientX - centerX) / zoom - pan.x;
    const worldY = (clientY - centerY) / zoom - pan.y;

    const dimensions = getBlockDimensions(blockType);
    const x = worldX - dimensions.width / 2;
    const y = worldY - dimensions.height / 2;

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
    setBlocks(prev => {
      const filtered = prev.filter(block => block.id !== id);

      const connected = new Set<string>();
      filtered.forEach(block => {
        if (block.type === 'drone-starter' && block.isConnected && block.serialNumber) {
          connected.add(block.serialNumber);
        }
      });
      setConnectedDrones(connected);

      return filtered;
    });
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
    localStorage.setItem('workspace-nodes', JSON.stringify(nodes));
  }, [nodes]);

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
            const transform = nodeTransforms[node.id] || { x: 0, y: 0 };
            const nodeBlocks = blocks.filter(b => node.childIds.includes(b.id));

            return (
              <div
                key={node.id}
                className={`node-container ${isActive ? 'active' : ''} ${isDraggingNode && isActive ? 'dragging' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${bbox.minX}px`,
                  top: `${bbox.minY}px`,
                  width: `${bbox.maxX - bbox.minX}px`,
                  height: `${bbox.maxY - bbox.minY}px`,
                  transform: `translate(${transform.x}px, ${transform.y}px)`,
                  pointerEvents: 'all',
                }}
              >
                <div
                  className="node-outer-label"
                  style={{
                    position: 'absolute',
                    left: '-8px',
                    top: '-28px',
                    pointerEvents: 'none'
                  }}
                >
                  {node.name}
                </div>

                <div
                  className={`node-outline ${isActive ? 'active' : ''}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    border: `2px solid rgba(0, 212, 255, ${isActive ? 0.9 : 0.6})`,
                    borderRadius: '8px',
                    cursor: 'move',
                    boxShadow: `0 0 ${isActive ? 25 : 15}px rgba(0, 212, 255, ${isActive ? 0.5 : 0.3})`,
                  }}
                  onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNodeId(node.id);
                  }}
                />

                {nodeBlocks.map(block => {
                  const BlockComponent = BLOCK_COMPONENT_MAP[block.type] || WorkspaceBlock;
                  const extraProps = block.type === 'flight-state-info'
                    ? { velocity: 15.2, acceleration: 2.3 }
                    : {};
                  const isDroneStarter = block.type === 'drone-starter';
                  const relativeX = block.x - bbox.minX;
                  const relativeY = block.y - bbox.minY;

                  return (
                    <div
                      key={block.id}
                      style={{
                        position: 'absolute',
                        left: `${relativeX}px`,
                        top: `${relativeY}px`,
                        pointerEvents: isDraggingNode && isActive ? 'none' : 'auto'
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
                        nodeName={node.name}
                        isHighlighted={block.isHighlighted}
                        onDroneNameChange={isDroneStarter ? handleDroneNameChange : undefined}
                        initialDroneName={isDroneStarter ? block.droneName : undefined}
                        initialSerialNumber={isDroneStarter ? block.serialNumber : undefined}
                        initialIsConnected={isDroneStarter ? block.isConnected : undefined}
                        onConnectionChange={isDroneStarter ? handleDroneConnectionChange : undefined}
                        disableDrag={true}
                        {...extraProps}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
          {blocks.filter(block => !block.nodeId).map(block => {
            const BlockComponent = BLOCK_COMPONENT_MAP[block.type] || WorkspaceBlock;
            const extraProps = block.type === 'flight-state-info'
              ? { velocity: 15.2, acceleration: 2.3 }
              : {};

            const isDroneStarter = block.type === 'drone-starter';

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
                  isHighlighted={block.isHighlighted}
                  onDroneNameChange={isDroneStarter ? handleDroneNameChange : undefined}
                  initialDroneName={isDroneStarter ? block.droneName : undefined}
                  initialSerialNumber={isDroneStarter ? block.serialNumber : undefined}
                  initialIsConnected={isDroneStarter ? block.isConnected : undefined}
                  onConnectionChange={isDroneStarter ? handleDroneConnectionChange : undefined}
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
          {finalRect && (
            <div
              className="ghost-rect"
              style={{
                position: 'absolute',
                left: `${Math.min(finalRect.startX, finalRect.endX)}px`,
                top: `${Math.min(finalRect.startY, finalRect.endY)}px`,
                width: `${Math.abs(finalRect.endX - finalRect.startX)}px`,
                height: `${Math.abs(finalRect.endY - finalRect.startY)}px`,
                border: '2px dashed rgba(0, 212, 255, 0.5)',
                background: 'rgba(0, 212, 255, 0.05)',
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
            onCreateNode={() => handleCreateNode(finalRect, droneName)}
            onUngroupNode={handleUngroupNode}
            isDragSelectMode={isDragSelectMode}
            canCreateNode={finalRect !== null || activeNodeId !== null}
            canUngroup={activeNodeId !== null && (nodes.find(n => n.id === activeNodeId)?.childIds.length ?? 0) > 0}
          />
          <DroneStatus connectedDroneCount={connectedDrones.size} />
        </div>
        {activeTab === 'map' && (
          <MapView
            serverStatus={serverStatus}
            onResetView={handleResetView}
            connectedDroneCount={connectedDrones.size}
          />
        )}
      </main>
    </div>
  );
}

export default App;
