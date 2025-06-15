export const getRelativePointerPosition = (stage) => {
  const transform = stage.getAbsoluteTransform().copy();
  transform.invert();
  const pos = stage.getPointerPosition();
  return transform.point(pos);
};

export const isMouseOrTouch = (e) => {
  if (!e || !e.evt) return false;
  const evt = e.evt;
  return evt.pointerType === "mouse" || evt.pointerType === "touch";
};

export const isPenInput = (e) => {
  if (!e || !e.evt) return false;
  const evt = e.evt;
  return evt.pointerType === "pen";
};

export const calculateNewPosition = (stage, pointer, newScale) => {
  if (!stage || !pointer) return { x: 0, y: 0 };

  const oldScale = stage.scaleX();
  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  return {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };
};

export const calculateNewScale = (oldScale, direction) => {
  const factor = 1.1;
  return direction > 0 ? oldScale * factor : oldScale / factor;
};

export const clampScale = (scale) => {
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 5;
  return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
};

export const isStylusEraser = (e) => {
  const evt = e.evt;
  return (
    evt.pointerType === "pen" &&
    (evt.buttons === 32 ||
      evt.button === 5 ||
      (evt.twist !== undefined && evt.twist > 90) ||
      evt.tangentialPressure > 0.5)
  );
};

export const getLineSegmentsAfterErase = (line, erasePoint, radius) => {
  const segments = [];
  let currentSegment = [];

  for (let i = 0; i < line.points.length - 1; i += 2) {
    const x = line.points[i];
    const y = line.points[i + 1];
    const distance = Math.hypot(x - erasePoint.x, y - erasePoint.y);

    if (distance > radius) {
      currentSegment.push(x, y);
    } else {
      if (currentSegment.length >= 4) {
        segments.push({
          ...line,
          points: currentSegment,
        });
      }
      currentSegment = [];
    }
  }

  if (currentSegment.length >= 4) {
    segments.push({
      ...line,
      points: currentSegment,
    });
  }

  return segments;
};

export const pointToSegmentDistance = (p, a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (dx === 0 && dy === 0) {
    return Math.hypot(p.x - a.x, p.y - a.y);
  }

  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));

  const closestX = a.x + clampedT * dx;
  const closestY = a.y + clampedT * dy;

  return Math.hypot(p.x - closestX, p.y - closestY);
};

export const getScreenPosition = (stage, canvasX, canvasY) => {
  if (!stage) return { x: 0, y: 0 }; // Handle case where stage is not yet available
  const transform = stage.getAbsoluteTransform();
  const screenPos = transform.point({ x: canvasX, y: canvasY });

  const container = stage.container();
  const containerRect = container.getBoundingClientRect();

  return {
    x: screenPos.x + containerRect.left,
    y: screenPos.y + containerRect.top,
  };
};