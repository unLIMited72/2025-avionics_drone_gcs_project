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

function anchors(ra: DOMRect, rb: DOMRect) {
  const acx = ra.left + ra.width / 2;
  const acy = ra.top + ra.height / 2;
  const bcx = rb.left + rb.width / 2;
  const bcy = rb.top + rb.height / 2;
  const dx = bcx - acx;
  const dy = bcy - acy;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const ax = dx >= 0 ? ra.right : ra.left;
    const bx = dx >= 0 ? rb.left : rb.right;
    return { ax, ay: acy, bx, by: bcy };
  } else {
    const ay = dy >= 0 ? ra.bottom : ra.top;
    const by = dy >= 0 ? rb.top : rb.bottom;
    return { ax: acx, ay, bx: bcx, by };
  }
}

function avoidRectPath(ra: DOMRect, rb: DOMRect, ro: DOMRect, m = 24) {
  const { ax, ay, bx, by } = anchors(ra, rb);
  const toRight = bx > ax;
  const laneX = toRight ? ro.right + m : ro.left - m;
  return `${ax},${ay} ${laneX},${ay} ${laneX},${by} ${bx},${by}`;
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

    const a = R(document.getElementById('drone-starter'));
    const b = R(document.getElementById('primary-flight'));

    console.log('[ConnectorLine] Starter→PFD rects:', { a, b });

    if (!a || !b) return null;

    const { ax, ay, bx, by } = anchors(a, b);

    console.log('[ConnectorLine] Starter→PFD line coords:', { ax, ay, bx, by });

    return (
      <line
        key="starter-pfd"
        x1={ax}
        y1={ay}
        x2={bx}
        y2={by}
        stroke="#00ff96"
        strokeWidth="3"
        strokeDasharray="8 6"
        fill="none"
      />
    );
  };

  const renderStarterToController = () => {
    if (!controllerLinked) return null;

    const a = R(document.getElementById('drone-starter'));
    const c = R(document.getElementById('controller-panel'));
    const o = R(document.getElementById('primary-flight'));

    console.log('[ConnectorLine] Starter→Controller rects:', { a, c, o });

    if (!a || !c || !o) return null;

    const pts = avoidRectPath(a, c, o, 24);

    console.log('[ConnectorLine] Starter→Controller polyline points:', pts);

    return (
      <polyline
        key="starter-controller"
        points={pts}
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
