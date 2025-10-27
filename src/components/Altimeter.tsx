import { useEffect, useState } from 'react';
import './Altimeter.css';

interface AltimeterProps {
  altitude: number;
}

export default function Altimeter({}: AltimeterProps) {
  const [animatedAltitude, setAnimatedAltitude] = useState(0);
  const maxAltitude = 300;
  const minAltitude = 0;

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

  const renderScale = () => {
    const marks = [];
    const displayHeight = 200;
    const altitudeRange = maxAltitude - minAltitude;

    for (let alt = minAltitude; alt <= maxAltitude; alt += 10) {
      const positionRatio = alt / altitudeRange;
      const position = displayHeight - (positionRatio * displayHeight);

      const isLargeMark = alt % 20 === 0;
      const showNumber = alt % 20 === 0;

      marks.push(
        <div
          key={alt}
          className="scale-mark-container"
          style={{ top: `${position}px` }}
        >
          <div className={`scale-mark ${isLargeMark ? 'large' : 'small'}`} />
          {showNumber && <span className="scale-number">{alt}</span>}
        </div>
      );
    }

    return marks;
  };

  const getIndicatorPosition = () => {
    const displayHeight = 200;
    const altitudeRange = maxAltitude - minAltitude;
    const positionRatio = animatedAltitude / altitudeRange;
    return displayHeight - (positionRatio * displayHeight);
  };

  return (
    <div className="altimeter-container">
      <div className="altimeter-label">Alt m</div>
      <div className="altimeter-display">
        <div className="scale-container">
          {renderScale()}
        </div>
        <div className="indicator-line" style={{ top: `${getIndicatorPosition()}px` }} />
      </div>
      <div className="altitude-value">
        {Math.round(animatedAltitude)}
      </div>
    </div>
  );
}
