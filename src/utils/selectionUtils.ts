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

  if (dx === 0 && dy === 0) {
    return { x: rect.x + rect.width, y: rect.y + rect.height / 2 };
  }

  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;
  const centerX = rect.x + halfWidth;
  const centerY = rect.y + halfHeight;

  const txLeft = dx !== 0 ? (-halfWidth) / dx : Infinity;
  const txRight = dx !== 0 ? halfWidth / dx : Infinity;
  const tyTop = dy !== 0 ? (-halfHeight) / dy : Infinity;
  const tyBottom = dy !== 0 ? halfHeight / dy : Infinity;

  const tMin = Math.max(
    Math.min(txLeft, txRight),
    Math.min(tyTop, tyBottom)
  );
  const tMax = Math.min(
    Math.max(txLeft, txRight),
    Math.max(tyTop, tyBottom)
  );

  const t = tMax >= 0 ? tMax : tMin;

  return {
    x: centerX + dx * t,
    y: centerY + dy * t
  };
}
