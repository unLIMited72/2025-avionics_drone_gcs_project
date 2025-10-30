import { useState, useEffect } from 'react';
import './ConnectorLine.css';

interface CurrentDrone {
  serial: string;
  name: string;
  connected: boolean;
}

interface ConnectorLineProps {
  currentDrone: CurrentDrone;
  controllerLinked: boolean;
}

function R(el: HTMLElement | null) {
  return el?.getBoundingClientRect?.();
}

function toLocal(svg: SVGSVGElement, x: number, y: number) {
  const pt = svg.createSVGPoint();
  pt.x = x;
  pt.y = y;
  const ctm = svg.getScreenCTM();
  if (!ctm) return pt;
  return pt.matrixTransform(ctm.inverse());
}

function centerInSvg(svg: SVGSVGElement, el: HTMLElement | null) {
  if (!el) return null;
  const r = R(el);
  if (!r) return null;
  return toLocal(svg, r.left + r.width / 2, r.top + r.height / 2);
}

function edgeAnchorsInSvg(svg: SVGSVGElement, aEl: HTMLElement | null, bEl: HTMLElement | null) {
  if (!aEl || !bEl) return null;

  const ar = R(aEl);
  const br = R(bEl);
  if (!ar || !br) return null;

  const ac = centerInSvg(svg, aEl);
  const bc = centerInSvg(svg, bEl);
  if (!ac || !bc) return null;

  const dx = bc.x - ac.x;
  const dy = bc.y - ac.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const aEdge = toLocal(svg, dx >= 0 ? ar.right : ar.left, ar.top + ar.height / 2);
    const bEdge = toLocal(svg, dx >= 0 ? br.left : br.right, br.top + br.height / 2);
    return { a: aEdge, b: bEdge };
  } else {
    const aEdge = toLocal(svg, ar.left + ar.width / 2, dy >= 0 ? ar.bottom : ar.top);
    const bEdge = toLocal(svg, br.left + br.width / 2, dy >= 0 ? br.top : br.bottom);
    return { a: aEdge, b: bEdge };
  }
}

export default function ConnectorLine({ currentDrone, controllerLinked }: ConnectorLineProps) {
  const [, setRedrawTrigger] = useState(0);

  const redraw = () => {
    setRedrawTrigger(prev => prev + 1);
    const svg = document.getElementById('connector-layer');
    if (svg) {
      svg.style.transform = 'translateZ(0)';
      requestAnimationFrame(() => {
        svg.style.transform = '';
      });
    }
  };

  useEffect(() => {
    console.log('[ConnectorLine] Mounted, currentDrone:', currentDrone, 'controllerLinked:', controllerLinked);

    window.addEventListener('resize', redraw);
    const interval = setInterval(redraw, 100);

    const layer = document.getElementById('connector-layer');
    if (layer) {
      layer.addEventListener('force-redraw', redraw);
    }

    setTimeout(redraw, 100);

    return () => {
      window.removeEventListener('resize', redraw);
      clearInterval(interval);
      if (layer) {
        layer.removeEventListener('force-redraw', redraw);
      }
    };
  }, [currentDrone.connected, controllerLinked]);

  const renderStarterToPFD = () => {
    if (!currentDrone.connected) return null;

    const svgEl = document.getElementById('connector-layer');
    if (!svgEl || !(svgEl instanceof SVGSVGElement)) return null;
    const svg = svgEl as SVGSVGElement;

    const aEl = document.getElementById('drone-starter');
    const bEl = document.getElementById('primary-flight');

    const anchors = edgeAnchorsInSvg(svg, aEl, bEl);

    if (!anchors) {
      console.log('[ConnectorLine] Starter→PFD: anchors not available');
      return null;
    }

    const { a, b } = anchors;

    console.log('[ConnectorLine] Starter→PFD SVG coords:', {
      ax: a.x, ay: a.y, bx: b.x, by: b.y
    });

    return (
      <line
        key="starter-pfd"
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke="#00ff96"
        strokeWidth="3"
        strokeDasharray="8 6"
        fill="none"
      />
    );
  };

  const renderStarterToController = () => {
    if (!controllerLinked) return null;

    const svgEl = document.getElementById('connector-layer');
    if (!svgEl || !(svgEl instanceof SVGSVGElement)) return null;
    const svg = svgEl as SVGSVGElement;

    const aEl = document.getElementById('drone-starter');
    const cEl = document.getElementById('controller-panel');

    const anchors = edgeAnchorsInSvg(svg, aEl, cEl);

    if (!anchors) {
      console.log('[ConnectorLine] Starter→Controller: anchors not available');
      return null;
    }

    const { a, b } = anchors;

    console.log('[ConnectorLine] Starter→Controller SVG coords:', {
      ax: a.x, ay: a.y, bx: b.x, by: b.y
    });

    return (
      <line
        key="starter-controller"
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke="#00ff96"
        strokeWidth="3"
        strokeDasharray="8 6"
        fill="none"
      />
    );
  };

  return (
    <svg id="connector-layer" className="connector-layer">
      {renderStarterToPFD()}
      {renderStarterToController()}
    </svg>
  );
}
