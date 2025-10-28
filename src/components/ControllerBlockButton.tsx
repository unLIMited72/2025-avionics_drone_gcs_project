import './DroneStarterBlock.css';

export default function ControllerBlockButton() {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('blockType', 'controller');
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      className="drone-function-block"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="block-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <circle cx="8" cy="14" r="2" />
          <circle cx="16" cy="14" r="2" />
        </svg>
      </div>
      <div className="block-info">
        <div className="block-name">Controller</div>
        <div className="block-description">Flight control & limits</div>
      </div>
    </div>
  );
}
