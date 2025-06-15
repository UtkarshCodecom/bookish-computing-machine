import { useState, useCallback, useEffect } from 'react';
import { calculateNewScale, calculateNewPosition, clampScale } from '../utils/canvasUtils';
import { MODES } from '../utils/constants';

const useStageTransform = (stageRef) => {
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [lastCenter, setLastCenter] = useState(null);
  const [lastDist, setLastDist] = useState(0);

  const getDistance = useCallback((p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  const getCenter = useCallback((p1, p2) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (stage && touch1 && touch2) {
      // Handle pinch and zoom
      const point1 = {
        x: touch1.clientX,
        y: touch1.clientY,
      };
      const point2 = {
        x: touch2.clientX,
        y: touch2.clientY,
      };

      if (!lastCenter) {
        setLastCenter(getCenter(point1, point2));
        setLastDist(getDistance(point1, point2));
        return;
      }

      const newCenter = getCenter(point1, point2);
      const newDist = getDistance(point1, point2);

      const deltaScale = newDist / lastDist;
      const newScale = clampScale(stage.scaleX() * deltaScale);

      const pointTo = {
        x: (newCenter.x - stage.x()) / stage.scaleX(),
        y: (newCenter.y - stage.y()) / stage.scaleY(),
      };

      const newPos = {
        x: newCenter.x - pointTo.x * newScale,
        y: newCenter.y - pointTo.y * newScale,
      };

      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
      setStageScale(newScale);
      setStagePosition(newPos);

      setLastDist(newDist);
      setLastCenter(newCenter);
    }
  }, [lastCenter, lastDist, getCenter, getDistance]);

  const handleWheel = useCallback((e) => {
    if (!stageRef.current) return;
    
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = calculateNewScale(oldScale, direction);
    const clampedScale = clampScale(newScale);
    
    setStageScale(clampedScale);

    const newPos = calculateNewPosition(stage, pointer, clampedScale);
    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position(newPos);
    setStagePosition(newPos);
  }, []);

  const handleDragEnd = useCallback((e) => {
    const stage = e.target;
    setStagePosition(stage.position());
  }, []);

  const resetView = useCallback(() => {
    if (!stageRef.current) return;
    
    const stage = stageRef.current;
    const newScale = 1;
    const newPos = { x: 0, y: 0 };
    
    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    setStageScale(newScale);
    setStagePosition(newPos);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (stage) {
      stage.on('touchmove', handleTouchMove);
      stage.on('touchend', () => {
        setLastCenter(null);
        setLastDist(0);
      });

      return () => {
        stage.off('touchmove', handleTouchMove);
        stage.off('touchend');
      };
    }
  }, [handleTouchMove]);

  return {
    stagePosition,
    stageScale,
    handleWheel,
    handleDragEnd,
    resetView
  };
};

export default useStageTransform;
