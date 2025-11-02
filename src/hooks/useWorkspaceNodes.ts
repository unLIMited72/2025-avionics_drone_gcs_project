import { useState, useCallback, useEffect } from 'react';
import { type Node, type DroppedBlock, type SelectionRect } from '../types/workspace';
import { getBlockDimensions } from '../constants/workspace';

export function useWorkspaceNodes(
  blocks: DroppedBlock[],
  setBlocks: React.Dispatch<React.SetStateAction<DroppedBlock[]>>,
  zoom: number
) {
  const [nodes, setNodes] = useState<Node[]>(() => {
    const saved = localStorage.getItem('workspace-nodes');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [nodeDragStart, setNodeDragStart] = useState({ x: 0, y: 0 });
  const [nodeTransforms, setNodeTransforms] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    localStorage.setItem('workspace-nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    if (!isDraggingNode || !activeNodeId) return;

    const handleNodeDragMove = (e: PointerEvent) => {
      e.preventDefault();
      const dx = (e.clientX - nodeDragStart.x) / zoom;
      const dy = (e.clientY - nodeDragStart.y) / zoom;

      requestAnimationFrame(() => {
        setNodeTransforms(prev => ({
          ...prev,
          [activeNodeId]: {
            x: (prev[activeNodeId]?.x || 0) + dx,
            y: (prev[activeNodeId]?.y || 0) + dy
          }
        }));
      });

      setNodeDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleNodeDragEnd = () => {
      setIsDraggingNode(false);

      const transform = nodeTransforms[activeNodeId];
      if (!transform || (transform.x === 0 && transform.y === 0)) {
        setNodeTransforms(prev => {
          const next = { ...prev };
          delete next[activeNodeId];
          return next;
        });
        return;
      }

      requestAnimationFrame(() => {
        setBlocks(prevBlocks => prevBlocks.map(block => {
          const node = nodes.find(n => n.id === activeNodeId);
          if (node && node.childIds.includes(block.id)) {
            return { ...block, x: block.x + transform.x, y: block.y + transform.y };
          }
          return block;
        }));

        setNodes(prevNodes => prevNodes.map(n => {
          if (n.id === activeNodeId) {
            return {
              ...n,
              rect: {
                startX: n.rect.startX + transform.x,
                startY: n.rect.startY + transform.y,
                endX: n.rect.endX + transform.x,
                endY: n.rect.endY + transform.y
              },
              transform: { x: 0, y: 0 }
            };
          }
          return n;
        }));

        setNodeTransforms(prev => {
          const next = { ...prev };
          delete next[activeNodeId];
          return next;
        });
      });
    };

    const handleWindowBlur = () => {
      if (isDraggingNode) {
        handleNodeDragEnd();
      }
    };

    document.addEventListener('pointermove', handleNodeDragMove);
    document.addEventListener('pointerup', handleNodeDragEnd);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('pointermove', handleNodeDragMove);
      document.removeEventListener('pointerup', handleNodeDragEnd);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isDraggingNode, activeNodeId, nodeDragStart, zoom, nodeTransforms, nodes, setBlocks]);

  const handleCreateNode = useCallback((finalRect: SelectionRect | null, droneName: string) => {
    if (!finalRect) {
      alert('먼저 드래그로 영역을 지정하세요.');
      return;
    }

    const selMinX = Math.min(finalRect.startX, finalRect.endX);
    const selMaxX = Math.max(finalRect.startX, finalRect.endX);
    const selMinY = Math.min(finalRect.startY, finalRect.endY);
    const selMaxY = Math.max(finalRect.startY, finalRect.endY);

    const targetBlocks = blocks.filter(block => {
      if (block.nodeId) return false;

      const dimensions = getBlockDimensions(block.type);
      const blockMinX = block.x;
      const blockMaxX = block.x + dimensions.width;
      const blockMinY = block.y;
      const blockMaxY = block.y + dimensions.height;

      return (
        selMinX < blockMaxX &&
        selMaxX > blockMinX &&
        selMinY < blockMaxY &&
        selMaxY > blockMinY
      );
    });

    if (targetBlocks.length === 0) {
      alert('선택 영역 내에 블록이 없습니다.');
      return;
    }

    const droneStarterBlock = targetBlocks.find(b => b.type === 'drone-starter');
    const nodeName = droneStarterBlock?.droneName || droneName || 'Unnamed Node';

    if (!nodeName.trim() || nodeName === 'Unnamed Node') {
      alert('드론 이름이 설정되지 않았습니다. drone starter에서 먼저 지정하세요.');
      return;
    }

    const nodeId = `node-${Date.now()}`;

    setNodes(prev => [...prev, {
      id: nodeId,
      childIds: targetBlocks.map(b => b.id),
      name: nodeName,
      rect: finalRect,
      transform: { x: 0, y: 0 }
    }]);

    setBlocks(prevBlocks => prevBlocks.map(block => {
      if (targetBlocks.some(tb => tb.id === block.id)) {
        return { ...block, nodeId, isHighlighted: false };
      }
      return block;
    }));

    setActiveNodeId(nodeId);
  }, [blocks, setBlocks]);

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
  }, [nodes, activeNodeId, setBlocks]);

  const getNodeBoundingBox = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const rect = node.rect;
    const minX = Math.min(rect.startX, rect.endX);
    const maxX = Math.max(rect.startX, rect.endX);
    const minY = Math.min(rect.startY, rect.endY);
    const maxY = Math.max(rect.startY, rect.endY);

    return { minX, minY, maxX, maxY };
  }, [nodes]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setActiveNodeId(nodeId);
  }, []);

  const handleNodePointerDown = useCallback((e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    setActiveNodeId(nodeId);
    setIsDraggingNode(true);
    setNodeDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  return {
    nodes,
    activeNodeId,
    isDraggingNode,
    nodeTransforms,
    setActiveNodeId,
    handleCreateNode,
    handleUngroupNode,
    getNodeBoundingBox,
    handleNodeClick,
    handleNodePointerDown
  };
}
