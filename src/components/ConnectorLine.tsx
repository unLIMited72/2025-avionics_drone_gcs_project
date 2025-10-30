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

function edgeAnchorsInSvg(svg: SVGSVGElement, aEl: HTMLElement | null, bEl: HTMLElement | null) {
  if (!aEl || !bEl) return null;

  const ar = R(aEl);
  const br = R(bEl);
  if (!ar || !br) return null;

  const ac = toLocal(svg, ar.left + ar.width / 2, ar.top + ar.height / 2);
  const bc = toLocal(svg, br.left + br.width / 2, br.top + br.height / 2);

  const dx = bc.x - ac.x;
  const dy = bc.y - ac.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const a = toLocal(svg, dx >= 0 ? ar.right : ar.left, ar.top + ar.height / 2);
    const b = toLocal(svg, dx >= 0 ? br.left : br.right, br.top + br.height / 2);
    return { a, b };
  } else {
    const a = toLocal(svg, ar.left + ar.width / 2, dy >= 0 ? ar.bottom : ar.top);
    const b = toLocal(svg, br.left + br.width / 2, dy >= 0 ? br.top : br.bottom);
    return { a, b };
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

  const renderPFDToController = () => {
    if (!controllerLinked) return null;

    const svgEl = document.getElementById('connector-layer');
    if (!svgEl || !(svgEl instanceof SVGSVGElement)) return null;
    const svg = svgEl as SVGSVGElement;

    const aEl = document.getElementById('primary-flight');
    const bEl = document.getElementById('controller-panel');

    const anchors = edgeAnchorsInSvg(svg, aEl, bEl);

    if (!anchors) {
      console.log('[ConnectorLine] PFD→Controller: anchors not available');
      return null;
    }

    const { a, b } = anchors;

    console.log('[ConnectorLine] PFD→Controller SVG coords:', {
      ax: a.x, ay: a.y, bx: b.x, by: b.y
    });

    return (
      <line
        key="pfd-controller"
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
      {renderPFDToController()}
    </svg>
  );
}
