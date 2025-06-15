import React from 'react';

const TextEditor = ({ textEditor }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textEditor.finishTextEditing();
    } else if (e.key === "Escape") {
      e.preventDefault();
      textEditor.finishTextEditing();
    }
  };

  if (!textEditor.isEditingText) return null;

  return (
    <input
      ref={textEditor.textInputRef}
      type="text"
      value={textEditor.textInputValue}
      onChange={(e) => textEditor.setTextInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={textEditor.finishTextEditing}
      className="text-editing-input"
      style={{
        position: "fixed",
        left: textEditor.textInputPosition.x,
        top: textEditor.textInputPosition.y,
        fontSize: `${textEditor.textSettings.fontSize}px`,
        fontFamily: textEditor.textSettings.fontFamily,
        color: textEditor.textSettings.color,
        fontWeight: textEditor.textSettings.bold ? "bold" : "normal",
        fontStyle: textEditor.textSettings.italic ? "italic" : "normal",
        background: "rgba(255, 255, 255, 0.95)",
        border: "2px solid #3b82f6",
        borderRadius: "4px",
        outline: "none",
        padding: "4px 8px",
        minWidth: "100px",
        zIndex: 1000,
      }}
      autoFocus
    />
  );
};

export default TextEditor;