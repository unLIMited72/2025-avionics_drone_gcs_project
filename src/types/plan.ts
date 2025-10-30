export interface PlanSelection {
  panelIds: string[];
}

export interface PlanNode {
  id: string;
  droneName: string;
  panelIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlanEdge {
  id: string;
  fromId: string;
  toId: string;
  anchorA: { x: number; y: number };
  anchorB: { x: number; y: number };
  orderIndex: number;
}

export interface PlanState {
  selection: PlanSelection;
  nodes: PlanNode[];
  edges: PlanEdge[];
  dragSelectMode: boolean;
}
