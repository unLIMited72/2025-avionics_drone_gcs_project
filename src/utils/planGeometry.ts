export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return !(
    b.x > a.x + a.width ||
    b.x + b.width < a.x ||
    b.y > a.y + a.height ||
    b.y + b.height < a.y
  );
}

export function getMarqueeRect(start: Point, end: Point): Rect {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  return { x, y, width, height };
}

export function rayRectIntersection(origin: Point, direction: Point, rect: Rect): Point | null {
  const center = {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };

  const dx = direction.x;
  const dy = direction.y;

  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
    return center;
  }

  let tMin = Infinity;
  let intersectionPoint: Point | null = null;

  if (Math.abs(dx) > 0.0001) {
    const t1 = (rect.x - origin.x) / dx;
    const t2 = (rect.x + rect.width - origin.x) / dx;
    for (const t of [t1, t2]) {
      if (t > 0 && t < tMin) {
        const y = origin.y + t * dy;
        if (y >= rect.y && y <= rect.y + rect.height) {
          tMin = t;
          intersectionPoint = { x: origin.x + t * dx, y };
        }
      }
    }
  }

  if (Math.abs(dy) > 0.0001) {
    const t1 = (rect.y - origin.y) / dy;
    const t2 = (rect.y + rect.height - origin.y) / dy;
    for (const t of [t1, t2]) {
      if (t > 0 && t < tMin) {
        const x = origin.x + t * dx;
        if (x >= rect.x && x <= rect.x + rect.width) {
          tMin = t;
          intersectionPoint = { x, y: origin.y + t * dy };
        }
      }
    }
  }

  if (intersectionPoint) {
    if (Math.abs(intersectionPoint.x - rect.x) < 5) intersectionPoint.x = rect.x;
    if (Math.abs(intersectionPoint.x - (rect.x + rect.width)) < 5) intersectionPoint.x = rect.x + rect.width;
    if (Math.abs(intersectionPoint.y - rect.y) < 5) intersectionPoint.y = rect.y;
    if (Math.abs(intersectionPoint.y - (rect.y + rect.height)) < 5) intersectionPoint.y = rect.y + rect.height;
  }

  return intersectionPoint;
}

export function calculateEdgeAnchors(
  rectA: Rect,
  rectB: Rect
): { anchorA: Point; anchorB: Point } {
  const centerA = {
    x: rectA.x + rectA.width / 2,
    y: rectA.y + rectA.height / 2
  };
  const centerB = {
    x: rectB.x + rectB.width / 2,
    y: rectB.y + rectB.height / 2
  };

  const dirAB = {
    x: centerB.x - centerA.x,
    y: centerB.y - centerA.y
  };

  const dirBA = {
    x: centerA.x - centerB.x,
    y: centerA.y - centerB.y
  };

  const anchorA = rayRectIntersection(centerA, dirAB, rectA) || centerA;
  const anchorB = rayRectIntersection(centerB, dirBA, rectB) || centerB;

  return { anchorA, anchorB };
}
