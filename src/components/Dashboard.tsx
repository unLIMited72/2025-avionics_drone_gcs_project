import { useEffect, useRef } from 'react';
import './Dashboard.css';
import FlightStateBlock from './FlightStateBlock';
import DroneStarterBlock from './DroneStarterBlock';
import ControllerBlockButton from './ControllerBlockButton';
import LogBlock from './LogBlock';

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Dashboard({ isOpen }: DashboardProps) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleGestureStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    panel.addEventListener('wheel', handleWheel, { passive: false });
    panel.addEventListener('gesturestart', handleGestureStart, { passive: false });
    panel.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      panel.removeEventListener('wheel', handleWheel);
      panel.removeEventListener('gesturestart', handleGestureStart);
      panel.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <aside ref={panelRef} className={`dashboard-panel ${isOpen ? 'open' : ''}`}>
      <div className="dashboard-header">
        <h2 className="dashboard-title">Drone Function Block</h2>
      </div>
      <div className="dashboard-content">
        <div className="blocks-section">
          <div className="blocks-list">
            <DroneStarterBlock />
            <FlightStateBlock />
            <ControllerBlockButton />
            <LogBlock />
          </div>
        </div>
      </div>
    </aside>
  );
}
