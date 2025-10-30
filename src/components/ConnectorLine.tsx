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

function anchorsLocal(aEl: HTMLElement | null, bEl: HTMLElement | null, root: HTMLElement | null) {
  const ar = R(aEl);
  const br = R(bEl);
  const rr = R(root);

  if (!ar || !br || !rr) return null;

  const acx = ar.left + ar.width / 2 - rr.left;
  const acy = ar.top + ar.height / 2 - rr.top;
  const bcx = br.left + br.width / 2 - rr.left;
  const bcy = br.top + br.height / 2 - rr.top;
  const dx = bcx - acx;
  const dy = bcy - acy;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const ax = dx >= 0 ? (ar.right - rr.left) : (ar.left - rr.left);
    const bx = dx >= 0 ? (br.left - rr.left) : (br.right - rr.left);
    return { ax, ay: acy, bx, by: bcy };
  } else {
    const ay = dy >= 0 ? (ar.bottom - rr.top) : (ar.top - rr.top);
    const by = dy >= 0 ? (br.top - rr.top) : (br.bottom - rr.top);
    return { ax: acx, ay, bx: bcx, by };
  }
}

function avoidRectPathLocal(
  aEl: HTMLElement | null,
  bEl: HTMLElement | null,
  obsEl: HTMLElement | null,
  root: HTMLElement | null,
  margin = 24
) {
  const anchors = anchorsLocal(aEl, bEl, root);
  if (!anchors) return null;

  const { ax, ay, bx, by } = anchors;
  const o = R(obsEl);
  const rr = R(root);

  if (!o || !rr) return null;

  const toRight = bx > ax;
  const laneX = toRight ? o.right - rr.left + margin : o.left - rr.left - margin;

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

    const root = document.getElementById('connector-layer');
    const aEl = document.getElementById('drone-starter');
    const bEl = document.getElementById('primary-flight');

    const anchors = anchorsLocal(aEl, bEl, root);

    console.log('[ConnectorLine] Starter→PFD elements:', {
      root: R(root),
      starter: R(aEl),
      pfd: R(bEl),
      anchors,
    });

    if (!anchors) return null;

    const { ax, ay, bx, by } = anchors;

    console.log('[ConnectorLine] Starter→PFD local coords:', { ax, ay, bx, by });

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

    const root = document.getElementById('connector-layer');
    const aEl = document.getElementById('drone-starter');
    const cEl = document.getElementById('controller-panel');
    const oEl = document.getElementById('primary-flight');

    const pts = avoidRectPathLocal(aEl, cEl, oEl, root, 24);

    console.log('[ConnectorLine] Starter→Controller elements:', {
      root: R(root),
      starter: R(aEl),
      controller: R(cEl),
      obstacle: R(oEl),
      points: pts,
    });

    if (!pts) return null;

    console.log('[ConnectorLine] Starter→Controller local polyline:', pts);

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
