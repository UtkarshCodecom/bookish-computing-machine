import React, { useState, useEffect } from "react";
import {
  colors,
  brushSizes,
  brushTypes,
  eraseSizes,
  fontFamilies,
  fontSizes,
  highlightColors,
} from "../utils/constants";

const FloatingMenu = ({
  showMenu,
  setShowMenu,
  mode,
  setMode,
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
  textSettings,
  updateSelectedTextStyle,
  selectedTextId,
  deleteSelectedText,
}) => {
  const [menuPosition, setMenuPosition] = useState({
    x: window.innerWidth - 320,
    y: 170,
  });
  const [isDraggingMenu, setIsDraggingMenu] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Button position and dragging state
  const [buttonPosition, setButtonPosition] = useState({
    x: window.innerWidth - 76,
    y: 100,
  });
  const [isDraggingButton, setIsDraggingButton] = useState(false);
  const [buttonDragOffset, setButtonDragOffset] = useState({ x: 0, y: 0 });

  // Menu dragging handlers
  const handleMenuMouseDown = (e) => {
    if (
      e.target.classList.contains("drag-handle") ||
      !e.target.matches("button, select, input, .color-btn, .size-btn")
    ) {
      setIsDraggingMenu(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMenuMouseMove = (e) => {
    if (isDraggingMenu) {
      const newX = Math.max(
        0,
        Math.min(window.innerWidth - 300, e.clientX - dragOffset.x)
      );
      const newY = Math.max(
        0,
        Math.min(window.innerHeight - 400, e.clientY - dragOffset.y)
      );
      setMenuPosition({ x: newX, y: newY });
    }
  };

  const handleMenuMouseUp = () => {
    setIsDraggingMenu(false);
  };

  // Button dragging handlers
  const handleButtonMouseDown = (e) => {
    setIsDraggingButton(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setButtonDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleButtonMouseMove = (e) => {
    if (isDraggingButton) {
      const buttonSize = 56;
      const newX = Math.max(
        buttonSize / 2,
        Math.min(
          window.innerWidth - buttonSize / 2,
          e.clientX - buttonDragOffset.x + buttonSize / 2
        )
      );
      const newY = Math.max(
        buttonSize / 2,
        Math.min(
          window.innerHeight - buttonSize / 2,
          e.clientY - buttonDragOffset.y + buttonSize / 2
        )
      );
      setButtonPosition({ x: newX, y: newY });
    }
  };

  const handleButtonMouseUp = () => {
    setIsDraggingButton(false);
  };

  const handleButtonClick = (e) => {
    if (!isDraggingButton) {
      setShowMenu(!showMenu);
    }
  };

  useEffect(() => {
    if (isDraggingMenu) {
      document.addEventListener("mousemove", handleMenuMouseMove);
      document.addEventListener("mouseup", handleMenuMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMenuMouseMove);
        document.removeEventListener("mouseup", handleMenuMouseUp);
      };
    }
  }, [isDraggingMenu, dragOffset]);

  useEffect(() => {
    if (isDraggingButton) {
      document.addEventListener("mousemove", handleButtonMouseMove);
      document.addEventListener("mouseup", handleButtonMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleButtonMouseMove);
        document.removeEventListener("mouseup", handleButtonMouseUp);
      };
    }
  }, [isDraggingButton, buttonDragOffset]);

  return (
    <>
      {/* Floating Menu Toggle - Draggable */}
      <button
        onMouseDown={handleButtonMouseDown}
        onClick={handleButtonClick}
        className={`floating-menu-toggle ${
          isDraggingButton ? "dragging" : ""
        } ${showMenu ? "active" : ""}`}
        style={{
          top: `${buttonPosition.y}px`,
          left: `${buttonPosition.x}px`,
        }}
      >
        {showMenu ? "✕" : "🎨"}
      </button>

      {/* Floating Menu */}
      {showMenu && (
        <aside
          className={`floating-menu ${isDraggingMenu ? "dragging" : ""}`}
          onMouseDown={handleMenuMouseDown}
          style={{
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
          }}
        >
          {/* Drag Handle */}
          <div className="drag-handle" />

          {/* Mode Toggle */}
          <section className="menu-section mode-section">
            <h3 className="section-title">Mode</h3>
            <div className="mode-buttons">
              <button
                onClick={() => setMode("draw")}
                className={`mode-btn draw-btn ${
                  mode === "draw" ? "active" : ""
                }`}
              >
                🖊️ Draw
              </button>
              <button
                onClick={() => setMode("text")}
                className={`mode-btn text-btn ${
                  mode === "text" ? "active" : ""
                }`}
              >
                📝 Text
              </button>
              <button
                onClick={() => setMode("erase")}
                className={`mode-btn erase-btn ${
                  mode === "erase" ? "active" : ""
                }`}
              >
                🧹 Erase
              </button>
              <button
                onClick={() => setMode("pan")}
                className={`mode-btn pan-btn ${mode === "pan" ? "active" : ""}`}
              >
                👋 Pan
              </button>
            </div>
          </section>

          {/* Erase Options */}
          {mode === "erase" && (
            <section className="menu-section erase-section">
              <h3 className="section-title">Erase Type</h3>
              <div className="erase-type-buttons">
                <button
                  onClick={() => setEraseType("partial")}
                  className={`erase-type-btn ${
                    eraseType === "partial" ? "active" : ""
                  }`}
                >
                  ✂️ Partial
                </button>
                <button
                  onClick={() => setEraseType("whole")}
                  className={`erase-type-btn ${
                    eraseType === "whole" ? "active" : ""
                  }`}
                >
                  🗑️ Whole Line
                </button>
              </div>

              <h4 className="subsection-title">Erase Size</h4>
              <div className="size-buttons">
                {eraseSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setEraseSize(size)}
                    className={`size-btn erase-size-btn ${
                      eraseSize === size ? "active" : ""
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Text Options */}
          {mode === "text" && (
            <section className="menu-section text-section">
              <h3 className="section-title">Text Settings</h3>

              {/* Font Family */}
              <div className="text-option">
                <h4 className="subsection-title">Font</h4>
                <select
                  value={textSettings.fontFamily}
                  onChange={(e) =>
                    updateSelectedTextStyle({ fontFamily: e.target.value })
                  }
                  className="font-select"
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div className="text-option">
                <h4 className="subsection-title">Size</h4>
                <div className="font-size-buttons">
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        updateSelectedTextStyle({ fontSize: size })
                      }
                      className={`font-size-btn ${
                        textSettings.fontSize === size ? "active" : ""
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div className="text-option">
                <h4 className="subsection-title">Text Color</h4>
                <div className="color-grid text-colors">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        updateSelectedTextStyle({ fill: color, color: color })
                      }
                      className={`color-btn ${
                        textSettings.color === color ? "active" : ""
                      }`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Style Options */}
              <div className="text-option">
                <h4 className="subsection-title">Style</h4>
                <div className="text-style-buttons">
                  <button
                    onClick={() =>
                      updateSelectedTextStyle({ bold: !textSettings.bold })
                    }
                    className={`text-style-btn bold-btn ${
                      textSettings.bold ? "active" : ""
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={() =>
                      updateSelectedTextStyle({ italic: !textSettings.italic })
                    }
                    className={`text-style-btn italic-btn ${
                      textSettings.italic ? "active" : ""
                    }`}
                  >
                    I
                  </button>
                  <button
                    onClick={() =>
                      updateSelectedTextStyle({
                        highlight: !textSettings.highlight,
                      })
                    }
                    className={`text-style-btn highlight-btn ${
                      textSettings.highlight ? "active" : ""
                    }`}
                  >
                    🖍️
                  </button>
                </div>
              </div>

              {/* Highlight Colors */}
              {textSettings.highlight && (
                <div className="text-option">
                  <h4 className="subsection-title">Highlight</h4>
                  <div className="highlight-colors">
                    {highlightColors.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          updateSelectedTextStyle({ highlightColor: color })
                        }
                        className={`highlight-color-btn ${
                          textSettings.highlightColor === color ? "active" : ""
                        }`}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Delete Selected Text */}
              {selectedTextId && (
                <button
                  onClick={deleteSelectedText}
                  className="delete-text-btn"
                >
                  🗑️ Delete Selected Text
                </button>
              )}
            </section>
          )}

          {/* Brush Type */}
          {mode === "draw" && (
            <section className="menu-section brush-section">
              <h3 className="section-title">Brush</h3>
              <div className="brush-type-buttons">
                {brushTypes.map((brush) => (
                  <button
                    key={brush.type}
                    onClick={() => setBrushType(brush.type)}
                    className={`brush-type-btn ${
                      brushType === brush.type ? "active" : ""
                    }`}
                  >
                    {brush.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Colors */}
          {mode === "draw" && (
            <section className="menu-section colors-section">
              <h3 className="section-title">Colors</h3>
              <div className="color-grid brush-colors">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBrushColor(color)}
                    className={`color-btn brush-color-btn ${
                      brushColor === color ? "active" : ""
                    }`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Brush Size */}
          {mode === "draw" && (
            <section className="menu-section size-section">
              <h3 className="section-title">Size</h3>
              <div className="size-buttons brush-sizes">
                {brushSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    className={`size-btn brush-size-btn ${
                      brushSize === size ? "active" : ""
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </section>
          )}
        </aside>
      )}
    </>
  );
};

export default FloatingMenu;