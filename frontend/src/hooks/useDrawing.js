import { useState, useCallback } from "react";
import { brushTypes, ERASE_TYPES, MODES } from "../utils/constants";
import { 
  getLineSegmentsAfterErase, 
  pointToSegmentDistance,
  getRelativePointerPosition,
  isPenInput,
  isStylusEraser
} from "../utils/canvasUtils";

const useDrawing = (stageRef) => {
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [brushColor, setBrushColor] = useState("#2563eb");
  const [brushSize, setBrushSize] = useState(3);
  const [brushType, setBrushType] = useState("pen");
  const [eraseType, setEraseType] = useState("partial");
  const [eraseSize, setEraseSize] = useState(20);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...lines]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, lines]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLines(history[historyIndex - 1]);
    } else if (historyIndex === 0) {
      setLines([]);
      setHistoryIndex(-1);
    }
  }, [history, historyIndex]);

  const getBrushStyle = useCallback(() => {
    const brush = brushTypes.find((b) => b.type === brushType);
    return {
      color: brushColor,
      size: brushSize,
      opacity: brush?.opacity || 1,
    };
  }, [brushColor, brushSize, brushType]);

  const eraseAtPoint = useCallback((point) => {
    if (eraseType === "whole") {
      const updatedLines = lines.filter(
        (line) => !isPointNearLine(point, line.points, eraseSize)
      );
      if (updatedLines.length !== lines.length) {
        setLines(updatedLines);
        return true;
      }
    } else {
      let hasChanged = false;
      const updatedLines = [];

      lines.forEach((line) => {
        const segments = getLineSegmentsAfterErase(line, point, eraseSize);
        if (segments.length === 0) {
          hasChanged = true;
        } else if (
          segments.length === 1 &&
          segments[0].points.length === line.points.length
        ) {
          updatedLines.push(line);
        } else {
          hasChanged = true;
          updatedLines.push(...segments);
        }
      });

      if (hasChanged) {
        setLines(updatedLines);
        return true;
      }
    }
    return false;
  }, [lines, eraseType, eraseSize]);

  const isPointNearLine = (point, linePoints, threshold) => {
    for (let i = 0; i < linePoints.length - 2; i += 2) {
      const x1 = linePoints[i];
      const y1 = linePoints[i + 1];
      const x2 = linePoints[i + 2];
      const y2 = linePoints[i + 3];

      const distance = pointToSegmentDistance(
        point,
        { x: x1, y: y1 },
        { x: x2, y: y2 }
      );
      if (distance < threshold) return true;
    }
    return false;
  };

  const handlePointerDown = useCallback((e, mode) => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    const point = getRelativePointerPosition(stage);

    if (mode === "pan" || mode === "text") return;

    if (isStylusEraser(e) || mode === "erase") {
      e.evt.preventDefault();
      setIsDrawing(true);
      const erased = eraseAtPoint(point);
      if (erased) saveToHistory();
      return;
    }

    if (mode !== "draw") return;

    if (!isPenInput(e) && e.evt.pointerType !== "touch" && e.evt.pointerType !== "mouse")
      return;

    e.evt.preventDefault();
    const style = getBrushStyle();
    setIsDrawing(true);
    setCurrentLine({
      tool: "draw",
      points: [point.x, point.y],
      color: style.color,
      size: style.size,
      opacity: style.opacity,
      type: brushType,
    });
  }, [getBrushStyle, brushType, eraseAtPoint, saveToHistory]);

  const handlePointerMove = useCallback((e, mode) => {
    if (!isDrawing || !stageRef.current) return;

    const stage = stageRef.current;
    const point = getRelativePointerPosition(stage);
    
    if (mode === "erase" || isStylusEraser(e)) {
      const erased = eraseAtPoint(point);
      if (erased) saveToHistory();
      return;
    }

    if (!currentLine || mode !== "draw") return;

    setCurrentLine((prevLine) => ({
      ...prevLine,
      points: [...prevLine.points, point.x, point.y],
    }));
  }, [isDrawing, currentLine, eraseAtPoint, saveToHistory]);

  const handlePointerUp = useCallback((e, mode) => {
    if (currentLine && !isStylusEraser(e) && mode === "draw") {
      setLines((prev) => [...prev, currentLine]);
      saveToHistory();
    }
    setCurrentLine(null);
    setIsDrawing(false);
  }, [currentLine, saveToHistory]);

  const clearCanvas = useCallback(() => {
    setLines([]);
    setCurrentLine(null);
    setIsDrawing(false);
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  return {
    lines,
    setLines,
    currentLine,
    isDrawing,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    brushType,
    setBrushType,
    eraseType,
    setEraseType,
    eraseSize,
    setEraseSize,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    undo,
    clearCanvas,
    canUndo: historyIndex >= 0
  };
};

export default useDrawing;