import { type BlockComponentType } from '../types/workspace';
import WorkspaceDroneStarter from '../components/WorkspaceDroneStarter';
import ControllerBlock from '../components/ControllerBlock';
import WorkspaceLog from '../components/WorkspaceLog';
import WorkspaceBlock from '../components/WorkspaceBlock';

export const CANVAS_WIDTH = 4000;
export const CANVAS_HEIGHT = 3000;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 2;
export const ZOOM_SPEED = 0.1;

export const BLOCK_COMPONENT_MAP: Record<string, BlockComponentType> = {
  'drone-starter': WorkspaceDroneStarter,
  'controller': ControllerBlock,
  'log': WorkspaceLog,
  'flight-state-info': WorkspaceBlock as BlockComponentType
};

export function getBlockDimensions(type: string): { width: number; height: number } {
  switch (type) {
    case 'log':
      return { width: 520, height: 450 };
    case 'controller':
      return { width: 320, height: 400 };
    case 'drone-starter':
      return { width: 280, height: 380 };
    case 'flight-state-info':
      return { width: 560, height: 380 };
    default:
      return { width: 300, height: 300 };
  }
}
