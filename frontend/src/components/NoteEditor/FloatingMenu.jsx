import React, { useState, useEffect } from "react";
import { useDragging } from "../../hooks/useDragging";
import {
  colors,
  brushSizes,
  brushTypes,
  eraseSizes,
  fontFamilies,
  fontSizes,
  highlightColors,
} from "../../utils/constants";

const FloatingMenu = ({
  showMenu,
  setShowMenu,
  mode,
  setMode,
  drawing,
  textEditor,
}) => {
  const menuDragging = useDragging({
    x: window.innerWidth - 320,
    y: 170,
  });

  const buttonDragging = useDragging({
    x: window.innerWidth - 76,
    y: 100,
  });

  const handleButtonClick = () => {
    if (!buttonDragging.isDragging) {
      setShowMenu(!showMenu);
    }
  };

  return (
    <>
      {/* Floating Menu Toggle */}
      <button
        onMouseDown={(e) => buttonDragging.handleMouseDown(e)}
        onClick={handleButtonClick}
        className={`floating-menu-toggle ${
          buttonDragging.isDragging ? "dragging" : ""
        } ${showMenu ? "active" : ""}`}
        style={{
          top: `${buttonDragging.position.y}px`,
          left: `${buttonDragging.position.x}px`,
        }}
      >
        {showMenu ? "✕" : "🎨"}
      </button>

      {/* Floating Menu */}
      {showMenu && (
        <aside
          className={`floating-menu ${menuDragging.isDragging ? "dragging" : ""}`}
          onMouseDown={(e) => menuDragging.handleMouseDown(e)}
          style={{
            top: `${menuDragging.position.y}px`,
            left: `${menuDragging.position.x}px`,
          }}
        >
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

          {/* Drawing Controls */}
          {mode === "draw" && (
            <>
              <section className="menu-section brush-section">
                <h3 className="section-title">Brush Type</h3>
                <div className="brush-type-buttons">
                  {brushTypes.map((brush) => (
                    <button
                      key={brush.type}
                      onClick={() => drawing.setBrushType(brush.type)}
                      className={`brush-type-btn ${
                        drawing.brushType === brush.type ? "active" : ""
                      }`}
                    >
                      {brush.name}
                    </button>
                  ))}
                </div>
              </section>

              <section className="menu-section colors-section">
                <h3 className="section-title">Colors</h3>
                <div className="color-grid brush-colors">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => drawing.setBrushColor(color)}
                      className={`color-btn brush-color-btn ${
                        drawing.brushColor === color ? "active" : ""
                      }`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </section>

              <section className="menu-section size-section">
                <h3 className="section-title">Brush Size</h3>
                <div className="size-buttons brush-sizes">
                  {brushSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => drawing.setBrushSize(size)}
                      className={`size-btn brush-size-btn ${
                        drawing.brushSize === size ? "active" : ""
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Erase Controls */}
          {mode === "erase" && (
            <section className="menu-section erase-section">
              <h3 className="section-title">Erase Type</h3>
              <div className="erase-type-buttons">
                <button
                  onClick={() => drawing.setEraseType("partial")}
                  className={`erase-type-btn ${
                    drawing.eraseType === "partial" ? "active" : ""
                  }`}
                >
                  ✂️ Partial
                </button>
                <button
                  onClick={() => drawing.setEraseType("whole")}
                  className={`erase-type-btn ${
                    drawing.eraseType === "whole" ? "active" : ""
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
                    onClick={() => drawing.setEraseSize(size)}
                    className={`size-btn erase-size-btn ${
                      drawing.eraseSize === size ? "active" : ""
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Text Controls */}
          {mode === "text" && (
            <section className="menu-section text-section">
              <h3 className="section-title">Text Settings</h3>

              <div className="text-option">
                <h4 className="subsection-title">Font</h4>
                <select
                  value={textEditor.textSettings.fontFamily}
                  onChange={(e) =>
                    textEditor.updateSelectedTextStyle({ fontFamily: e.target.value })
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

              <div className="text-option">
                <h4 className="subsection-title">Size</h4>
                <div className="font-size-buttons">
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        textEditor.updateSelectedTextStyle({ fontSize: size })
                      }
                      className={`font-size-btn ${
                        textEditor.textSettings.fontSize === size ? "active" : ""
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-option">
                <h4 className="subsection-title">Text Color</h4>
                <div className="color-grid text-colors">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        textEditor.updateSelectedTextStyle({ fill: color, color: color })
                      }
                      className={`color-btn ${
                        textEditor.textSettings.color === color ? "active" : ""
                      }`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="text-option">
                <h4 className="subsection-title">Style</h4>
                <div className="text-style-buttons">
                  <button
                    onClick={() =>
                      textEditor.updateSelectedTextStyle({ 
                        bold: !textEditor.textSettings.bold,
                        fontWeight: !textEditor.textSettings.bold ? "bold" : "normal"
                      })
                    }
                    className={`text-style-btn bold-btn ${
                      textEditor.textSettings.bold ? "active" : ""
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={() =>
                      textEditor.updateSelectedTextStyle({ 
                        italic: !textEditor.textSettings.italic,
                        fontStyle: !textEditor.textSettings.italic ? "italic" : "normal"
                      })
                    }
                    className={`text-style-btn italic-btn ${
                      textEditor.textSettings.italic ? "active" : ""
                    }`}
                  >
                    I
                  </button>
                  <button
                    onClick={() =>
                      textEditor.updateSelectedTextStyle({
                        highlight: !textEditor.textSettings.highlight,
                      })
                    }
                    className={`text-style-btn highlight-btn ${
                      textEditor.textSettings.highlight ? "active" : ""
                    }`}
                  >
                    🖍️
                  </button>
                </div>
              </div>

              {textEditor.textSettings.highlight && (
                <div className="text-option">
                  <h4 className="subsection-title">Highlight</h4>
                  <div className="highlight-colors">
                    {highlightColors.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          textEditor.updateSelectedTextStyle({ highlightColor: color })
                        }
                        className={`highlight-color-btn ${
                          textEditor.textSettings.highlightColor === color ? "active" : ""
                        }`}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {textEditor.selectedTextId && (
                <button
                  onClick={textEditor.deleteSelectedText}
                  className="delete-text-btn"
                >
                  🗑️ Delete Selected Text
                </button>
              )}
            </section>
          )}
        </aside>
      )}
    </>
  );
};

export default FloatingMenu;