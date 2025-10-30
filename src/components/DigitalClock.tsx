import { useState, useEffect } from 'react';
import './DigitalClock.css';

interface DigitalClockProps {
  onReset?: () => void;
}

export default function DigitalClock({ onReset }: DigitalClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <div className="clock-controls">
      <button
        className="reset-view-btn"
        onClick={onReset}
        title="Reset view to default"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M3 21v-5h5"/>
        </svg>
      </button>
      <div className="digital-clock">
        <div className="clock-display">
          <span className="time-segment">{hours}</span>
          <span className="time-separator">:</span>
          <span className="time-segment">{minutes}</span>
          <span className="time-separator">:</span>
          <span className="time-segment">{seconds}</span>
        </div>
      </div>
    </div>
  );
}
