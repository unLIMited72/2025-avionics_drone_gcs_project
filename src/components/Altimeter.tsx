import { useEffect, useState } from 'react';
import './Altimeter.css';

interface AltimeterProps {
  altitude: number;
}

export default function Altimeter({}: AltimeterProps) {
  const [animatedAltitude, setAnimatedAltitude] = useState(0);
  const maxAltitude = 300;

  useEffect(() => {
    const animationDuration = 8000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % animationDuration) / animationDuration;

      let currentAlt;
      if (progress < 0.5) {
        currentAlt = progress * 2 * maxAltitude;
      } else {
        currentAlt = maxAltitude - ((progress - 0.5) * 2 * maxAltitude);
      }

      setAnimatedAltitude(currentAlt);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="altimeter-container">
      <div className="altimeter-label">Alt m</div>
      <div className="altitude-value">
        {Math.round(animatedAltitude)}
      </div>
    </div>
  );
}
