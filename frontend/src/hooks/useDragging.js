import { useState, useEffect } from 'react';

export const useDragging = (initialPosition) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e, constraints = {}) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e, constraints = {}) => {
    if (!isDragging) return;

    const {
      minX = 0,
      maxX = window.innerWidth,
      minY = 0,
      maxY = window.innerHeight,
      offsetX = 0,
      offsetY = 0,
    } = constraints;

    const newX = Math.max(
      minX,
      Math.min(maxX, e.clientX - dragOffset.x + offsetX)
    );
    const newY = Math.max(
      minY,
      Math.min(maxY, e.clientY - dragOffset.y + offsetY)
    );

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      const mouseMoveHandler = (e) => handleMouseMove(e);
      const mouseUpHandler = () => handleMouseUp();

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);

      return () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };
    }
  }, [isDragging, dragOffset]);

  return {
    position,
    isDragging,
    setPosition,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};