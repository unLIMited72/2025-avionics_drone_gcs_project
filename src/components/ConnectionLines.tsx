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

function getClosestAnchor(
  fromBlock: Block,
  toBlock: Block
): { from: { x: number; y: number }; to: { x: number; y: number } } {
  const fromDim = getBlockDimensions(fromBlock.type);
  const toDim = getBlockDimensions(toBlock.type);

  const fromCenterX = fromBlock.x + fromDim.width / 2;
  const fromCenterY = fromBlock.y + fromDim.height / 2;
  const toCenterX = toBlock.x + toDim.width / 2;
  const toCenterY = toBlock.y + toDim.height / 2;

  const fromAnchors = [
    { x: fromBlock.x, y: fromCenterY },
    { x: fromBlock.x + fromDim.width, y: fromCenterY },
    { x: fromCenterX, y: fromBlock.y },
    { x: fromCenterX, y: fromBlock.y + fromDim.height }
  ];

  const toAnchors = [
    { x: toBlock.x, y: toCenterY },
    { x: toBlock.x + toDim.width, y: toCenterY },
    { x: toCenterX, y: toBlock.y },
    { x: toCenterX, y: toBlock.y + toDim.height }
  ];

  let minDist = Infinity;
  let bestFrom = fromAnchors[0];
  let bestTo = toAnchors[0];

  for (const fa of fromAnchors) {
    for (const ta of toAnchors) {
      const dist = Math.sqrt(Math.pow(fa.x - ta.x, 2) + Math.pow(fa.y - ta.y, 2));
      if (dist < minDist) {
        minDist = dist;
        bestFrom = fa;
        bestTo = ta;
      }
    }
  }

  return { from: bestFrom, to: bestTo };
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

    edges.forEach(([fromId, toId]) => {
      const fromBlock = blocks.find(b => b.id === fromId);
      const toBlock = blocks.find(b => b.id === toId);

      if (!fromBlock || !toBlock) return;

      const anchors = getClosestAnchor(fromBlock, toBlock);

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
