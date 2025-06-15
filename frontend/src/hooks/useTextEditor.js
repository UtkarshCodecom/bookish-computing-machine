import { useState, useCallback, useRef } from 'react';
import { getScreenPosition, getRelativePointerPosition } from '../utils/canvasUtils';
import { MODES } from '../utils/constants';

const useTextEditor = (stageRef) => {
  const [textElements, setTextElements] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [isAddingText, setIsAddingText] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingTextId, setEditingTextId] = useState(null);
  const [textInputValue, setTextInputValue] = useState("");
  const [textInputPosition, setTextInputPosition] = useState({ x: 0, y: 0 });
  const [isDraggingText, setIsDraggingText] = useState(false);
  const textInputRef = useRef();  const [textSettings, setTextSettings] = useState({
    fontSize: 24,
    fontFamily: "Arial",
    color: "#000000",
    bold: false,
    italic: false,
    highlight: false,
    highlightColor: "#FFD700",
    width: 300,
  });
  const handleStageClick = useCallback((e, mode) => {
    if (!stageRef.current) return;

    const isTextElement = e.target.getAttr && e.target.getAttr("id")?.startsWith("text-");
    if (isTextElement) {
      const clickedTextId = e.target.getAttr("id").replace("text-", "");
      setSelectedTextId(clickedTextId);
      return;
    }

    const parent = e.target.getParent && e.target.getParent();
    const clickedOnTransformer = parent && parent.className === "Transformer";
    if (!clickedOnTransformer) {
      setSelectedTextId(null);
      if (
        mode === MODES.TEXT &&
        !isEditingText &&
        (e.target === stageRef.current || e.target.getClassName() === "Line")
      ) {
        const pos = getRelativePointerPosition(stageRef.current);
        const screenPos = getScreenPosition(stageRef.current, pos.x, pos.y);
        const newTextEl = {
          id: Date.now().toString(),
          x: pos.x,
          y: pos.y,
          text: "",
          ...textSettings
        };
        setTextElements(prev => [...prev, newTextEl]);
        setTextInputPosition(screenPos);
        setTextInputValue("");
        setIsEditingText(true);
        setEditingTextId(newTextEl.id);
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.focus();
          }
        }, 0);
      }
    }
  }, [isEditingText, textSettings, stageRef]);

  const startTextEditing = useCallback((textEl) => {
    if (isEditingText || !stageRef.current) return;

    setIsEditingText(true);
    setEditingTextId(textEl.id);
    setTextInputValue(textEl.text);

    const screenPos = getScreenPosition(stageRef.current, textEl.x, textEl.y);
    setTextInputPosition(screenPos);

    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        textInputRef.current.select();
      }
    }, 10);
  }, [isEditingText]);

  const finishTextEditing = useCallback(() => {
    if (!isEditingText || !editingTextId) return;

    if (textInputValue.trim()) {
      setTextElements((prev) =>
        prev.map((text) =>
          text.id === editingTextId ? { ...text, text: textInputValue } : text
        )
      );
    } else {
      setTextElements((prev) =>
        prev.filter((text) => text.id !== editingTextId)
      );
      setSelectedTextId(null);
    }

    setTimeout(() => {
      setIsEditingText(false);
      setEditingTextId(null);
      setTextInputValue("");
      setIsAddingText(false);
    }, 0);
  }, [isEditingText, editingTextId, textInputValue]);

  const handleTextDblClick = useCallback((textEl) => {
    startTextEditing(textEl);
  }, [startTextEditing]);

  const handleTextDragStart = useCallback((id) => {
    setIsDraggingText(true);
  }, []);

  const handleTextDragEnd = useCallback((id, e) => {
    e.cancelBubble = true;
    setIsDraggingText(false);

    const newX = e.target.x();
    const newY = e.target.y();

    setTextElements((prev) =>
      prev.map((text) =>
        text.id === id ? { ...text, x: newX, y: newY } : text
      )
    );
  }, []);

  const updateSelectedTextStyle = useCallback((updates) => {
    if (selectedTextId) {
      setTextElements((prev) =>
        prev.map((text) =>
          text.id === selectedTextId ? { ...text, ...updates } : text
        )
      );
    }
    setTextSettings((prev) => ({ ...prev, ...updates }));
  }, [selectedTextId]);

  const deleteSelectedText = useCallback(() => {
    if (selectedTextId) {
      setTextElements((prev) =>
        prev.filter((text) => text.id !== selectedTextId)
      );
      setSelectedTextId(null);
    }
  }, [selectedTextId]);

  const clearText = useCallback(() => {
    setTextElements([]);
    setSelectedTextId(null);
    setIsEditingText(false);
    setEditingTextId(null);
    setTextInputValue("");
    setIsAddingText(false);
  }, []);

  return {
    textElements,
    selectedTextId,
    isEditingText,
    editingTextId,
    textInputValue,
    textInputPosition,
    isDraggingText,
    textSettings,
    textInputRef,
    handleStageClick,
    handleTextDblClick,
    handleTextDragStart,
    handleTextDragEnd,
    updateSelectedTextStyle,
    deleteSelectedText,
    setTextInputValue,
    finishTextEditing,
    clearText
  };
};

export default useTextEditor;
