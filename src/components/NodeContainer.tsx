import './NodeContainer.css';

interface NodeContainerProps {
  nodeId: string;
  droneName: string;
  children: React.ReactNode;
  onSelectNode: (nodeId: string) => void;
  isSelected: boolean;
}

export default function NodeContainer({
  nodeId,
  droneName,
  children,
  onSelectNode,
  isSelected
}: NodeContainerProps) {
  return (
    <div
      className={`node-container ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelectNode(nodeId)}
    >
      <div className="node-header">
        <span className="node-title">Node — {droneName}</span>
      </div>
      <div className="node-content">
        {children}
      </div>
    </div>
  );
}
