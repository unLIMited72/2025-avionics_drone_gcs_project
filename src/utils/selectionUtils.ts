interface Rectangle {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function doRectanglesIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

export function calculateAnchorPoint(
  fromRect: { x: number; y: number; width: number; height: number },
  toRect: { x: number; y: number; width: number; height: number },
  isFrom: boolean
): { x: number; y: number } {
  const fromCenter = {
    x: fromRect.x + fromRect.width / 2,
    y: fromRect.y + fromRect.height / 2
  };
  const toCenter = {
    x: toRect.x + toRect.width / 2,
    y: toRect.y + toRect.height / 2
  };

  const rect = isFrom ? fromRect : toRect;
  const targetCenter = isFrom ? toCenter : fromCenter;
  const sourceCenter = isFrom ? fromCenter : toCenter;

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;

  const centerX = rect.x + halfWidth;
  const centerY = rect.y + halfHeight;

  if (dx === 0 && dy === 0) {
    return { x: centerX + halfWidth, y: centerY };
  }

  const t1 = dx !== 0 ? halfWidth / Math.abs(dx) : Infinity;
  const t2 = dy !== 0 ? halfHeight / Math.abs(dy) : Infinity;
  const t = Math.min(t1, t2);

  return {
    x: centerX + dx * t,
    y: centerY + dy * t
  };
}
