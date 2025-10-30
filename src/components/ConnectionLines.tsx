import { useEffect, useRef } from 'react';
import './ConnectionLines.css';

interface Block {
  id: string;
  x: number;
  y: number;
  type: string;
}

interface ConnectionLinesProps {
  edges: Array<[string, string]>;
  blocks: Block[];
  zoom: number;
  pan: { x: number; y: number };
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

function rayBoxIntersection(
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  centerX: number,
  centerY: number,
  dirX: number,
  dirY: number
): { x: number; y: number } {
  const candidates: Array<{ x: number; y: number; t: number }> = [];

  if (dirX !== 0) {
    const tLeft = (boxX - centerX) / dirX;
    const yLeft = centerY + tLeft * dirY;
    if (tLeft > 0 && yLeft >= boxY && yLeft <= boxY + boxH) {
      candidates.push({ x: boxX, y: yLeft, t: tLeft });
    }

    const tRight = (boxX + boxW - centerX) / dirX;
    const yRight = centerY + tRight * dirY;
    if (tRight > 0 && yRight >= boxY && yRight <= boxY + boxH) {
      candidates.push({ x: boxX + boxW, y: yRight, t: tRight });
    }
  }

  if (dirY !== 0) {
    const tTop = (boxY - centerY) / dirY;
    const xTop = centerX + tTop * dirX;
    if (tTop > 0 && xTop >= boxX && xTop <= boxX + boxW) {
      candidates.push({ x: xTop, y: boxY, t: tTop });
    }

    const tBottom = (boxY + boxH - centerY) / dirY;
    const xBottom = centerX + tBottom * dirX;
    if (tBottom > 0 && xBottom >= boxX && xBottom <= boxX + boxW) {
      candidates.push({ x: xBottom, y: boxY + boxH, t: tBottom });
    }
  }

  if (candidates.length === 0) {
    return { x: centerX, y: centerY };
  }

  candidates.sort((a, b) => a.t - b.t);
  return { x: candidates[0].x, y: candidates[0].y };
}

function getClosestAnchor(
  fromBlock: Block,
  toBlock: Block,
  orderIndex: number
): { from: { x: number; y: number }; to: { x: number; y: number } } {
  const fromDim = getBlockDimensions(fromBlock.type);
  const toDim = getBlockDimensions(toBlock.type);

  const fromCenterX = fromBlock.x + fromDim.width / 2;
  const fromCenterY = fromBlock.y + fromDim.height / 2;
  const toCenterX = toBlock.x + toDim.width / 2;
  const toCenterY = toBlock.y + toDim.height / 2;

  const dirX = toCenterX - fromCenterX;
  const dirY = toCenterY - fromCenterY;

  const anchorA = rayBoxIntersection(
    fromBlock.x,
    fromBlock.y,
    fromDim.width,
    fromDim.height,
    fromCenterX,
    fromCenterY,
    dirX,
    dirY
  );

  const anchorB = rayBoxIntersection(
    toBlock.x,
    toBlock.y,
    toDim.width,
    toDim.height,
    toCenterX,
    toCenterY,
    -dirX,
    -dirY
  );

  console.info('EDGE', {
    from: fromBlock.id,
    to: toBlock.id,
    anchorA,
    anchorB,
    orderIndex
  });

  return { from: anchorA, to: anchorB };
}

export default function ConnectionLines({ edges, blocks, zoom, pan }: ConnectionLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.lineCap = 'round';

    edges.forEach(([fromId, toId], index) => {
      const fromBlock = blocks.find(b => b.id === fromId);
      const toBlock = blocks.find(b => b.id === toId);

      if (!fromBlock || !toBlock) return;

      const anchors = getClosestAnchor(fromBlock, toBlock, index);

      const fromX = anchors.from.x * zoom + pan.x + rect.width / 2;
      const fromY = anchors.from.y * zoom + pan.y + rect.height / 2;
      const toX = anchors.to.x * zoom + pan.x + rect.width / 2;
      const toY = anchors.to.y * zoom + pan.y + rect.height / 2;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
    });
  }, [edges, blocks, zoom, pan]);

  return <canvas ref={canvasRef} className="connection-lines-canvas" />;
}
