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

function rect(el: HTMLElement | null) {
  return el?.getBoundingClientRect?.();
}

function edgeAnchors(ra: DOMRect, rb: DOMRect) {
  const acx = ra.left + ra.width / 2;
  const acy = ra.top + ra.height / 2;
  const bcx = rb.left + rb.width / 2;
  const bcy = rb.top + rb.height / 2;
  const dx = bcx - acx;
  const dy = bcy - acy;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const ax = dx >= 0 ? ra.right : ra.left;
    const bx = dx >= 0 ? rb.left : rb.right;
    const ay = acy;
    const by = bcy;
    return { ax, ay, bx, by };
  } else {
    const ay = dy >= 0 ? ra.bottom : ra.top;
    const by = dy >= 0 ? rb.top : rb.bottom;
    const ax = acx;
    const bx = bcx;
    return { ax, ay, bx, by };
  }
}

export default function ConnectorLine({ currentDrone, controllerLinked }: ConnectorLineProps) {
  const [, setRedrawTrigger] = useState(0);

  const redraw = () => {
    setRedrawTrigger(prev => prev + 1);
  };

  useEffect(() => {
    window.addEventListener('resize', redraw);
    const interval = setInterval(redraw, 100);

    const layer = document.getElementById('connector-layer');
    if (layer) {
      layer.addEventListener('force-redraw', redraw);
    }

    return () => {
      window.removeEventListener('resize', redraw);
      clearInterval(interval);
      if (layer) {
        layer.removeEventListener('force-redraw', redraw);
      }
    };
  }, []);

  const renderStarterToPFD = () => {
    if (!currentDrone.connected) return null;

    const a = rect(document.getElementById('drone-starter'));
    const b = rect(document.getElementById('primary-flight'));
    if (!a || !b) return null;

    const { ax, ay, bx, by } = edgeAnchors(a, b);
    return (
      <line
        key="starter-pfd"
        x1={ax}
        y1={ay}
        x2={bx}
        y2={by}
        className="connector-line"
      />
    );
  };

  const renderStarterToController = () => {
    if (!controllerLinked) return null;

    const a = rect(document.getElementById('drone-starter'));
    const c = rect(document.getElementById('controller-panel'));
    if (!a || !c) return null;

    const { ax, ay, bx, by } = edgeAnchors(a, c);
    return (
      <line
        key="starter-controller"
        x1={ax}
        y1={ay}
        x2={bx}
        y2={by}
        className="connector-line"
      />
    );
  };

  return (
    <svg className="connector-layer" id="connector-layer">
      {renderStarterToPFD()}
      {renderStarterToController()}
    </svg>
  );
}
