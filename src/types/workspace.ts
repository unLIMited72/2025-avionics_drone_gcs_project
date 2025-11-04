import { type ComponentType } from 'react';

export interface DroppedBlock {
  id: string;
  type: 'flight-state-info' | 'drone-starter' | 'controller' | 'log' | 'drone-pack';
  x: number;
  y: number;
  isMinimized?: boolean;
  nodeId?: string;
  isHighlighted?: boolean;
  droneName?: string;
  serialNumber?: string;
  isConnected?: boolean;
}

export interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface Node {
  id: string;
  childIds: string[];
  name: string;
  rect: SelectionRect;
  transform: { x: number; y: number };
}

export interface BaseBlockProps {
  id: string;
  initialX: number;
  initialY: number;
  zoom: number;
  onRemove: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onToggleMinimize: (id: string) => void;
  isMinimized: boolean;
  nodeName?: string;
  isHighlighted?: boolean;
  onDroneNameChange?: (blockId: string, name: string) => void;
  disableDrag?: boolean;
  initialDroneName?: string;
  initialSerialNumber?: string;
  initialIsConnected?: boolean;
  onConnectionChange?: (blockId: string, serialNumber: string, isConnected: boolean) => void;
}

export interface FlightBlockProps extends BaseBlockProps {
  velocity: number;
  acceleration: number;
}

export type BlockComponentType = ComponentType<BaseBlockProps | FlightBlockProps>;
