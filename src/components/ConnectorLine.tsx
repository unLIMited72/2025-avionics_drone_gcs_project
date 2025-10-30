import { useState, useEffect } from 'react';
import './ConnectorLine.css';

interface CurrentDrone {
  serial: string;
  name: string;
  connected: boolean;
}

interface ConnectorLineProps {
  currentDrone: CurrentDrone;
}

function getCenterXY(el: HTMLElement | null): { x: number; y: number } {
  if (!el) return { x: 0, y: 0 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export default function ConnectorLine({ currentDrone }: ConnectorLineProps) {
  const [coords, setCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  const updateCoords = () => {
    const starter = document.getElementById('drone-starter');
    const pfd = document.getElementById('primary-flight');

    if (starter && pfd) {
      const s = getCenterXY(starter);
      const p = getCenterXY(pfd);
      setCoords({ x1: s.x, y1: s.y, x2: p.x, y2: p.y });
    }
  };

  useEffect(() => {
    if (!currentDrone.connected) return;

    updateCoords();

    window.addEventListener('resize', updateCoords);

    const checkInterval = setInterval(updateCoords, 100);

    return () => {
      window.removeEventListener('resize', updateCoords);
      clearInterval(checkInterval);
    };
  }, [currentDrone.connected]);

  if (!currentDrone.connected) return null;

  return (
    <svg className="connector-line-overlay">
      <line
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        className="connector-line"
      />
    </svg>
  );
}
