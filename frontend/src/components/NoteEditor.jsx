import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchNoteById, saveNote, updateCurrentNote } from "../store/notesSlice";
import { brushTypes, MODES } from "../utils/constants";
import FloatingMenu from "./FloatingMenu";
import "./NoteEditor.css";
import { colors } from "../utils/constants";
import { debounce } from "lodash";
import img from "../assets/1.png"; // Adjust the path as needed
import { getNote, updateNote } from "../services/api";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Stage, Layer, Line, Text, Transformer, Image, Rect } from "react-konva";

const NoteEditor = ({ onSave, initialData, disabled }) => {
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [templateImage, setTemplateImage] = useState(null);
  const [mode, setMode] = useState("draw");
  const [brushColor, setBrushColor] = useState("#2563eb");
  const [brushSize, setBrushSize] = useState(3);
  const [brushType, setBrushType] = useState("pen");
  const [eraseType, setEraseType] = useState("partial");
  const [eraseSize, setEraseSize] = useState(20);
  const [showMenu, setShowMenu] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);

  const stageRef = useRef();
  const transformerRef = useRef();
  const textInputRef = useRef();

  const [textElements, setTextElements] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [isAddingText, setIsAddingText] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingTextId, setEditingTextId] = useState(null);
  const [textInputValue, setTextInputValue] = useState("");
  const [textInputPosition, setTextInputPosition] = useState({ x: 0, y: 0 });
  const [isDraggingText, setIsDraggingText] = useState(false);  const [textSettings, setTextSettings] = useState({
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    color: "#000000",
    textShadow: "none",
    bold: false,
    italic: false,
    highlight: false,
    highlightColor: "",
    width: 300,
  });

  const [bgImage, setBgImage] = useState(null);
  const [bgImageProps, setBgImageProps] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isImageSelected, setIsImageSelected] = useState(false);
  const bgImageRef = useRef();
  const bgTransformerRef = useRef();

  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const dispatch = useDispatch();
  const { currentNote, status, unsavedChanges } = useSelector(state => state.notes);  // Update Redux store in real-time
  const updateStore = (updates) => {
    // Format the updates to match the schema structure
    const formattedUpdates = {
      title: currentNote?.title || 'Untitled Note',
      content: {
        lines: updates.lines?.map(line => ({
          points: line.points,
          color: line.color || '#000000',
          size: line.size || 2,
          opacity: line.opacity || 1,
          type: line.type || 'pen'
        })) || [],
        textElements: updates.textElements || [],
        stageState: {
          position: updates.stagePosition || stagePosition,
          scale: updates.stageScale || stageScale
        }
      },
      updatedAt: new Date().toISOString()
    };

    dispatch(updateCurrentNote(formattedUpdates));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          // Calculate initial size while preserving aspect ratio
          const maxInitialWidth = 800; // Maximum initial width
          const scale =
            img.width > maxInitialWidth ? maxInitialWidth / img.width : 1;
          const width = img.width * scale;
          const height = img.height * scale;

          // Position in the center of the visible area
          const stageBox = stageRef.current.getAbsolutePosition();
          const x = -stageBox.x + (window.innerWidth - width) / 2;
          const y = -stageBox.y + (window.innerHeight - height) / 2;

          setBgImage(img);
          setBgImageProps({
            x: x,
            y: y,
            width: width,
            height: height,
          });
          setIsImageSelected(true);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Add this effect to attach transformer to image
  useEffect(() => {
    if (isImageSelected && bgImageRef.current && bgTransformerRef.current) {
      bgTransformerRef.current.nodes([bgImageRef.current]);
      bgTransformerRef.current.getLayer().batchDraw();
    }
  }, [isImageSelected, bgImage]);
  const handleImageClick = (e) => {
    e.cancelBubble = true; // Prevent stage click
    setIsImageSelected(true);
  };

  useEffect(() => {
    const image = new window.Image();
    image.src = img; // Use the imported image
    image.onload = () => setTemplateImage(image);
  }, []);

  useEffect(() => {
    if (selectedTextId && transformerRef.current) {
      const selectedNode = stageRef.current.findOne(`#text-${selectedTextId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();

        const handleTransform = () => {
          const newWidth = selectedNode.width() * selectedNode.scaleX();
          selectedNode.scaleX(1);

          setTextElements((prev) =>
            prev.map((text) =>
              text.id === selectedTextId
                ? { ...text, width: Math.max(50, newWidth) }
                : text
            )
          );
        };

        const handleTransformEnd = () => {
          const newWidth = selectedNode.width() * selectedNode.scaleX();
          selectedNode.scaleX(1);
          selectedNode.width(newWidth);

          setTextElements((prev) =>
            prev.map((text) =>
              text.id === selectedTextId
                ? { ...text, width: Math.max(50, newWidth) }
                : text
            )
          );
        };

        selectedNode.on("transform", handleTransform);
        selectedNode.on("transformend", handleTransformEnd);

        return () => {
          selectedNode.off("transform", handleTransform);
          selectedNode.off("transformend", handleTransformEnd);
        };
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedTextId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isEditingText &&
        textInputRef.current &&
        !textInputRef.current.contains(e.target)
      ) {
        finishTextEditing();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditingText]);

  // useEffect(() => {
  //   if (isEditingText && editingTextId && textInputValue !== "") {
  //     const timeoutId = setTimeout(() => {
  //       handleTextChange(editingTextId, textInputValue);
  //     }, 300);

  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [textInputValue, isEditingText, editingTextId]);

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...lines]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLines(history[historyIndex - 1]);
    } else if (historyIndex === 0) {
      setLines([]);
      setHistoryIndex(-1);
    }
  };

  const getRelativePointerPosition = (stage) => {
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    return transform.point(pos);
  };

  const isStylusEraser = (e) => {
    const evt = e.evt;
    return (
      evt.pointerType === "pen" &&
      (evt.buttons === 32 ||
        evt.button === 5 ||
        (evt.twist !== undefined && evt.twist > 90) ||
        evt.tangentialPressure > 0.5)
    );
  };

  const getBrushStyle = () => {
    const brush = brushTypes.find((b) => b.type === brushType);
    return {
      color: brushColor,
      size: brushSize,
      opacity: brush?.opacity || 1,
    };
  };

  const eraseAtPoint = (point) => {
    if (eraseType === "whole") {
      const updatedLines = lines.filter(
        (line) => !isPointNearLine(point, line.points)
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
  };

  const getLineSegmentsAfterErase = (line, erasePoint, radius) => {
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

  const handlePointerDown = (e) => {
    const evt = e.evt;
    const isPen = evt.pointerType === "pen";
    const isStylus = isStylusEraser(e);

    const isTextElement = e.target.getAttr("id")?.startsWith("text-");

    if (isTextElement) {
      return;
    }
    if (isPen && isStylus) {
      setMode("erase");
    } else if (isPen && mode === "pan") {
      setMode("draw");
    } else if (isPen && !isStylus && mode === "erase") {
      setMode("draw");
    }

    const stage = e.target.getStage();
    const point = getRelativePointerPosition(stage);

    if (mode === "erase" || isStylus) {
      evt.preventDefault();
      setIsDrawing(true);
      const erased = eraseAtPoint(point);
      if (erased) {
        saveToHistory();
      }
      return;
    }

    if (mode !== "draw") return;

    if (!isPen && evt.pointerType !== "touch" && evt.pointerType !== "mouse")
      return;

    evt.preventDefault();

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
  };

  const handlePointerMove = (e) => {
    const evt = e.evt;

    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = getRelativePointerPosition(stage);
    const isStylus = isStylusEraser(e);

    if (mode === "erase" || isStylus) {
      const erased = eraseAtPoint(point);
      if (erased) {
        saveToHistory();
      }
      return;
    }

    if (!currentLine || mode !== "draw") return;

    setCurrentLine((prevLine) => ({
      ...prevLine,
      points: [...prevLine.points, point.x, point.y],
    }));
  };  const handlePointerUp = (e) => {
    if (currentLine && !isStylusEraser(e) && mode === "draw") {
      const newLines = [...lines, currentLine];
      setLines(newLines);
      
      // Format and update the store
      const formattedLine = {
        points: currentLine.points,
        color: currentLine.color || '#000000',
        size: currentLine.size || 2,
        opacity: currentLine.opacity || 1,
        type: currentLine.type || 'pen'
      };
      
      updateStore({
        lines: [...lines, formattedLine],
        textElements,
        stagePosition,
        stageScale
      });
      
      saveToHistory();
    }
    setCurrentLine(null);
    setIsDrawing(false);
  };

  const handleDragEnd = (e) => {
    // Prevent canvas move if just finished dragging text
    if (isDraggingText) return;
    const stage = e.target;
    setStagePosition(stage.position());
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;

    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    setStageScale(clampedScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position(newPos);
    setStagePosition(newPos);
  };

  const getScreenPosition = (canvasX, canvasY) => {
    const stage = stageRef.current;
    const transform = stage.getAbsoluteTransform();
    const screenPos = transform.point({ x: canvasX, y: canvasY });

    const container = stage.container();
    const containerRect = container.getBoundingClientRect();

    return {
      x: screenPos.x + containerRect.left,
      y: screenPos.y + containerRect.top,
    };
  };

  const startTextEditing = (textEl) => {
    if (isEditingText) return;

    setIsEditingText(true);
    setEditingTextId(textEl.id);
    setTextInputValue(textEl.text);

    const screenPos = getScreenPosition(textEl.x, textEl.y);
    setTextInputPosition(screenPos);

    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        textInputRef.current.select();
      }
    }, 10);
  };

  const finishTextEditing = () => {
    if (!isEditingText || !editingTextId) return;

    if (textInputValue.trim()) {
      handleTextChange(editingTextId, textInputValue);
    } else {
      setTextElements((prev) =>
        prev.filter((text) => text.id !== editingTextId)
      );
      setSelectedTextId(null);
    }

    // Delay clearing state to allow blur event to finish
    setTimeout(() => {
      setIsEditingText(false);
      setEditingTextId(null);
      setTextInputValue("");
      setIsAddingText(false);
    }, 0);
  };

  const handleTextInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      finishTextEditing();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (isAddingText) {
        setTextElements((prev) =>
          prev.filter((text) => text.id !== editingTextId)
        );
      }
      setIsEditingText(false);
      setEditingTextId(null);
      setTextInputValue("");
      setIsAddingText(false);
      setSelectedTextId(null);
    }
  };

  const handleTextInputBlur = () => {
    finishTextEditing();
  };

  const handleStageClick = (e) => {
    const parent = e.target.getParent && e.target.getParent();
    const clickedOnTransformer = parent && parent.className === "Transformer";
    const isTextElement = e.target.getAttr("id")?.startsWith("text-");

    if (e.target === e.target.getStage()) {
      setIsImageSelected(false);
    }
    if (e.target === e.target.getStage()) {
      setIsImageSelected(false);
    }

    if (isTextElement) {
      const clickedTextId = e.target.getAttr("id").replace("text-", "");
      setSelectedTextId(clickedTextId);
      return;
    }

    if (!clickedOnTransformer) {
      setSelectedTextId(null);

      if (
        mode === "text" &&
        !isAddingText &&
        !isEditingText &&
        (e.target === e.target.getStage() || e.target.getClassName() === "Line")
      ) {
        const stage = e.target.getStage();
        const point = getRelativePointerPosition(stage);

        const newText = {
          id: Date.now().toString(),
          x: point.x,
          y: point.y,
          text: "Type here...",
          fontSize: textSettings.fontSize,
          fontFamily: textSettings.fontFamily,
          fill: textSettings.color,
          fontWeight: textSettings.bold ? "bold" : "normal",
          fontStyle: textSettings.italic ? "italic" : "normal",
          highlight: textSettings.highlight,
          highlightColor: textSettings.highlightColor,
          width: textSettings.width,
        };

        setTextElements((prev) => [...prev, newText]);
        setSelectedTextId(newText.id);
        setIsAddingText(true);

        setTimeout(() => startTextEditing(newText), 50);
      }
    }
  };

  const handleTextClick = (textEl) => {
    setSelectedTextId(textEl.id);
  };

  const handleTextDblClick = (textEl) => {
    startTextEditing(textEl);
  };

  const handleTextChange = (id, newText) => {
    const updatedElements = textElements.map(text => 
      text.id === id ? { ...text, text: newText } : text
    );
    setTextElements(updatedElements);
    updateStore({ content: { 
      ...currentNote.content,
      textElements: updatedElements 
    }});
  };

  const handleTextDragStart = (id) => {
    setIsDraggingText(true);
  };

  const handleTextDragEnd = (id, e) => {
    e.cancelBubble = true;
    setIsDraggingText(false);

    const newX = e.target.x();
    const newY = e.target.y();

    setTextElements((prev) =>
      prev.map((text) =>
        text.id === id ? { ...text, x: newX, y: newY } : text
      )
    );
  };

  const updateSelectedTextStyle = (updates) => {
    console.log("Updating text style:", updates);
    if (selectedTextId) {
      setTextElements((prev) =>
        prev.map((text) =>
          text.id === selectedTextId ? { ...text, ...updates } : text
        )
      );
    }
    setTextSettings((prev) => ({ ...prev, ...updates }));
  };

  const deleteSelectedText = () => {
    if (selectedTextId) {
      setTextElements((prev) =>
        prev.filter((text) => text.id !== selectedTextId)
      );
      setSelectedTextId(null);
    }
  };

  const isPointNearLine = (point, linePoints) => {
    const threshold = eraseType === "whole" ? eraseSize : 5;
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

  const pointToSegmentDistance = (p, a, b) => {
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

  const clearCanvas = () => {
    setLines([]);
    setCurrentLine(null);
    setIsDrawing(false);
    setTextElements([]);
    setSelectedTextId(null);
  };

  const resetView = () => {
    const stage = stageRef.current;
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  };

  const getModeColor = () => {
    switch (mode) {
      case "draw":
        return "#10b981";
      case "text":
        return "#8b5cf6";
      case "erase":
        return "#ef4444";
      case "pan":
        return "#6366f1";
      default:
        return "#6366f1";
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case "draw":
        return "🖊️";
      case "text":
        return "📝";
      case "erase":
        return "🧹";
      case "pan":
        return "👋";
      default:
        return "🖊️";
    }
  };

  const getModeName = () => {
    switch (mode) {
      case "draw":
        return "Drawing";
      case "text":
        return "Text";
      case "erase":
        return "Erasing";
      case "pan":
        return "Panning";
      default:
        return "Drawing";
    }
  };
  const drawGrid = () => {
    const gridSize = 20;
    const points = [];

    if (!stageRef.current) return points;

    // Get the visible area in stage coordinates
    const stage = stageRef.current;
    const scale = stage.scaleX();
    const pos = stage.position();

    // Calculate the visible area bounds
    const viewLeft = -pos.x / scale;
    const viewTop = -pos.y / scale;
    const viewWidth = window.innerWidth / scale;
    const viewHeight = window.innerHeight / scale;

    // Add some padding to prevent grid from disappearing during scroll
    const padWidth = viewWidth;
    const padHeight = viewHeight;

    // Calculate grid boundaries
    const startX = Math.floor((viewLeft - padWidth) / gridSize) * gridSize;
    const endX = Math.ceil((viewLeft + viewWidth + padWidth) / gridSize) * gridSize;
    const startY = Math.floor((viewTop - padHeight) / gridSize) * gridSize;
    const endY = Math.ceil((viewTop + viewHeight + padHeight) / gridSize) * gridSize;

    // Draw horizontal lines
    for (let i = startY; i <= endY; i += gridSize) {
      points.push([startX, i, endX, i]);
    }

    // Draw vertical lines
    for (let i = startX; i <= endX; i += gridSize) {
      points.push([i, startY, i, endY]);
    }

    return points;
  };

  const memoizedGrid = React.useMemo(() => {
    return drawGrid();
  }, [stagePosition.x, stagePosition.y, stageScale]);

  useEffect(() => {
    if (stageRef.current) {
      // Force grid layer to redraw when position or scale changes
      const gridLayer = stageRef.current.findOne('Layer:nth-child(2)');
      if (gridLayer) {
        gridLayer.batchDraw();
      }
    }
  }, [stagePosition, stageScale]);

  useEffect(() => {
    if (id) {
      dispatch(fetchNoteById(id));
    }
  }, [id, dispatch]);
  useEffect(() => {
    if (currentNote && id) {
      // Set all the state from the loaded note
      // Handle both top-level and nested content
      const lines = currentNote.lines || currentNote.content?.lines || [];
      const textElements = currentNote.textElements || currentNote.content?.textElements || [];
      
      setLines(lines);
      setTextElements(textElements);
      
      // Load background image if exists
      const bgImageData = currentNote.backgroundImage || currentNote.content?.backgroundImage;
      if (bgImageData) {
        const img = new window.Image();
        img.onload = () => {
          setBgImage(img);
          setBgImageProps(bgImageData);
        };
        img.src = bgImageData.dataUrl;
      }
      
      setLoading(false);
    }
  }, [currentNote, id]);  const handleSave = async () => {
    try {
      // Format the data to match the backend model
      const formattedLines = lines.map(line => ({
        points: line.points,
        color: line.color || '#000000',
        size: line.size || 2,
        opacity: line.opacity || 1,
        type: line.type || 'pen'
      }));

      const saveData = {
        id: currentNote?._id,
        data: {
          title: currentNote?.title || 'Untitled Note',
          content: {
            lines: formattedLines,
            textElements,
            stageState: {
              position: stagePosition,
              scale: stageScale
            },
            backgroundImage: bgImage
              ? {
                  dataUrl: bgImage.src,
                  ...bgImageProps,
                }
              : null
          }
        }
      };

      console.log('Saving note with data:', saveData);
      const savedNote = await dispatch(saveNote(saveData)).unwrap();
      
      toast.success('Note saved successfully');
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save note');
      setError(err.message || 'Failed to save note');
    }
  };

  const handleSaveClick = () => {
    onSave({
        lines,
        textElements,
        stagePosition,
        stageScale,
        templateImage
    });
};

  // Add debounced update store
  const debouncedUpdateStore = useCallback(
    debounce((data) => {
      try {
        dispatch(updateCurrentNote(data));
      } catch (err) {
        console.error('Failed to update note:', err);
        toast.error('Failed to save changes');
      }
    }, 300),
    [dispatch]
  );

  // Add effect for auto-saving
  useEffect(() => {
    if (lines.length > 0 || textElements.length > 0) {
      debouncedUpdateStore({ 
        lines,
        textElements,
        stagePosition,
        stageScale
      });
    }
  }, [lines, textElements, debouncedUpdateStore]);

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="note-studio-header">
        <div className="header-left">
          <h1 className="app-title">✨ Note Studio</h1>
          <div className="flex items-center space-x-4">
            <div className="mode-badge" style={{ background: getModeColor() }}>
              {getModeIcon()} {getModeName()}
            </div>
            <div className="zoom-badge">{Math.round(stageScale * 100)}%</div>
            {unsavedChanges && (
              <span className="text-amber-500 text-sm">●&nbsp;Unsaved changes</span>
            )}
          </div>
        </div>

        <nav className="header-nav">
          <button 
            onClick={handleSave}
            disabled={disabled || !unsavedChanges}
            className={`nav-button save-btn ${!unsavedChanges ? 'opacity-50' : ''}`}
          >
            {disabled ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Saving...
              </span>
            ) : (
              <>💾 {unsavedChanges ? 'Save changes' : 'Saved'}</>
            )}
          </button>
          
          <button onClick={resetView} className="nav-button reset-btn">
            🎯 Reset View
          </button>
          <button
            onClick={undo}
            disabled={historyIndex < 0}
            className={`nav-button undo-btn ${
              historyIndex < 0 ? "disabled" : ""
            }`}
          >
            ↶ Undo
          </button>
          <button onClick={clearCanvas} className="nav-button clear-btn">
            🗑️ Clear
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="nav-button">
            🖼️ Add Image
          </label>
        </nav>
      </header>

      <div className={`relative flex-grow ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
        <main className="note-studio-main">
          <header className="note-studio-header">
            <div className="header-left">
              <h1 className="app-title">✨ Note Studio</h1>
              <div
                style={{
                  background: getModeColor(),
                }}
                className="mode-badge"
              >
                {getModeIcon()} {getModeName()}
              </div>
              <div className="zoom-badge">{Math.round(stageScale * 100)}%</div>
            </div>

            <nav className="header-nav">
              <button onClick={handleSave} className="nav-button save-btn">
                💾 Save
              </button>
              <button onClick={resetView} className="nav-button reset-btn">
                🎯 Reset View
              </button>
              <button
                onClick={undo}
                disabled={historyIndex < 0}
                className={`nav-button undo-btn ${
                  historyIndex < 0 ? "disabled" : ""
                }`}
              >
                ↶ Undo
              </button>
              <button onClick={clearCanvas} className="nav-button clear-btn">
                🗑️ Clear
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                id="image-upload"
              />
              <label htmlFor="image-upload" className="nav-button">
                🖼️ Add Image
              </label>
            </nav>
          </header>

          <FloatingMenu
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            mode={mode}
            setMode={setMode}
            brushColor={brushColor}
            setBrushColor={setBrushColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            brushType={brushType}
            setBrushType={setBrushType}
            eraseType={eraseType}
            setEraseType={setEraseType}
            eraseSize={eraseSize}
            setEraseSize={setEraseSize}
            colors={colors}
            textElements={textElements}
            setTextElements={setTextElements}
            textSettings={textSettings}
            setTextSettings={setTextSettings}
            updateSelectedTextStyle={updateSelectedTextStyle}
            deleteSelectedText={deleteSelectedText}
            selectedTextId={selectedTextId}
          />

          {isEditingText && (
            <input
              ref={textInputRef}
              type="text"
              value={textInputValue}
              onChange={(e) => setTextInputValue(e.target.value)}
              onKeyDown={handleTextInputKeyDown}
              onBlur={handleTextInputBlur}
              style={{
                position: "fixed",
                left: textInputPosition.x,
                top: textInputPosition.y,
                fontSize: `${textSettings.fontSize}px`,
                fontFamily: textSettings.fontFamily,
                color: textSettings.color,
                fontWeight: textSettings.bold ? "bold" : "normal",
                fontStyle: textSettings.italic ? "italic" : "normal",
                background: "transparent",
                border: "none",
                borderRadius: "4px",
                outline: "none",
                minWidth: "100px",
                zIndex: 1000,
                height: `${textSettings.fontSize}px`,
              }}
            />
          )}

          <section className="canvas-container">
            <Stage
              onClick={handleStageClick}
              width={Math.max(window.innerWidth * 2, 2000)}
              height={Math.max(window.innerHeight * 2, 2000)}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              perfectDrawEnabled={false}
              listening={!isDrawing}
              onTouchEnd={handlePointerUp}
              onWheel={handleWheel}
              onDragEnd={handleDragEnd}
              ref={stageRef}
              draggable={
                mode === "pan" &&
                !selectedTextId &&
                !isDrawing &&
                !isDraggingText &&
                !isEditingText
              }
              x={stagePosition.x}
              y={stagePosition.y}
              scaleX={stageScale}
              scaleY={stageScale}
              className={`canvas-stage mode-${mode}`}
            >
              <Layer>
                {/* White background */}
                <Rect
                  x={0}
                  y={0}
                  width={Math.max(window.innerWidth * 2, 2000)}
                  height={Math.max(window.innerHeight * 2, 2000)}
                  fill="#ffffff"
                  listening={false}
                />
              </Layer>

              {/* Grid Layer */}
              <Layer>
                {memoizedGrid.map((points, i) => (
                  <Line
                    key={`grid-${i}`}
                    points={points}
                    stroke="#f0f0f0"
                    strokeWidth={1}
                    listening={false}
                  />
                ))}
              </Layer>

              {/* Images Layer */}
              <Layer>
                {bgImage && (
                  <>
                    <Image
                      ref={bgImageRef}
                      image={bgImage}
                      x={bgImageProps.x}
                      y={bgImageProps.y}
                      width={bgImageProps.width}
                      height={bgImageProps.height}
                      draggable={true}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        setIsImageSelected(true);
                      }}
                      onDragEnd={(e) => {
                        setBgImageProps({
                          ...bgImageProps,
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                      }}
                    />
                    {isImageSelected && (
                      <Transformer
                        ref={bgTransformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                          const ratio = bgImageProps.width / bgImageProps.height;
                          const width = Math.max(50, newBox.width);
                          const height = width / ratio;
                          return {
                            x: newBox.x,
                            y: newBox.y,
                            width: width,
                            height: height,
                          };
                        }}
                        enabledAnchors={[
                          "top-left",
                          "top-right",
                          "bottom-left",
                          "bottom-right",
                        ]}
                        rotateEnabled={false}
                      />
                    )}
                  </>
                )}
              </Layer>

              {/* Drawing Layer */}
              <Layer>
                {lines.map((line, i) => (
                  <Line
                    key={i}
                    points={line.points}
                    stroke={line.color || "#000000"}
                    strokeWidth={line.size || 2}
                    tension={0.5}
                    lineCap="round"
                    globalCompositeOperation="source-over"
                    opacity={line.opacity || 1}
                  />
                ))}

                {currentLine && (
                  <Line
                    points={currentLine.points}
                    stroke={currentLine.color}
                    strokeWidth={currentLine.size}
                    tension={0.5}
                    lineCap="round"
                    globalCompositeOperation="source-over"
                    opacity={currentLine.opacity}
                  />
                )}

                {textElements.map((textEl) => (
                  <React.Fragment key={textEl.id}>
                    {textEl.highlight && (
                      <Rect
                        x={textEl.x - 2}
                        y={textEl.y - 2}
                        width={textEl.width + 4}
                        height={textEl.fontSize + 4}
                        fill={textEl.highlightColor}
                        listening={false}
                      />
                    )}

                    <Text
                      id={`text-${textEl.id}`}
                      x={textEl.x}
                      y={textEl.y}
                      text={textEl.text}
                      width={textEl.width}
                      fontSize={textEl.fontSize}
                      fontFamily={textEl.fontFamily}
                      fill={textEl.fill}
                      minHeight={textEl.fontSize}
                      fontStyle={textEl.fontStyle}
                      fontWeight={textEl.fontWeight}
                      draggable={!isEditingText}
                      onDragStart={(e) => {
                        e.cancelBubble = true; // Prevent stage drag
                        handleTextDragStart(textEl.id);
                      }}
                      onDragEnd={(e) => {
                        e.cancelBubble = true; // Prevent stage drag
                        handleTextDragEnd(textEl.id, e);
                      }}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        handleTextClick(textEl);
                      }}
                      onDblClick={(e) => {
                        e.cancelBubble = true;
                        handleTextDblClick(textEl);
                      }}
                      visible={editingTextId !== textEl.id}
                      listening={!isEditingText}
                    />
                  </React.Fragment>
                ))}
              </Layer>
            </Stage>
          </section>
        </main>
      </div>
    </div>
  );
};

export default NoteEditor;
