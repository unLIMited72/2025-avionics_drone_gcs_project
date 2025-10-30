interface MinimapProps {
  isVisible: boolean;
  canvasWidth: number;
  canvasHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (x: number, y: number) => void;
  blocks: Array<{ id: string; x: number; y: number }>;
}

export default function Minimap({
  isVisible
}: MinimapProps) {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '16px',
      width: '200px',
      height: '150px',
      background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
      border: '1px solid rgba(0, 212, 255, 0.4)',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      zIndex: 150
    }}>
      <div style={{
        padding: '8px',
        color: '#e0e0e0',
        fontSize: '12px',
        fontWeight: 500
      }}>
        Minimap
      </div>
    </div>
  );
}
