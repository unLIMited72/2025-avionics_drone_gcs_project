import { useState, useEffect } from 'react';
import './DigitalClock.css';

export default function DigitalClock() {
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
    <div className="digital-clock">
      <div className="clock-display">
        <span className="time-segment">{hours}</span>
        <span className="time-separator">:</span>
        <span className="time-segment">{minutes}</span>
        <span className="time-separator">:</span>
        <span className="time-segment">{seconds}</span>
      </div>
    </div>
  );
}
