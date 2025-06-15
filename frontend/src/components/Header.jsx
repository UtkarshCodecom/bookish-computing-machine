import React from 'react';
import { getModeColor, getModeIcon, getModeName } from '../utils/drawingUtils';

const Header = ({ mode, stageScale, onResetView, onUndo, onClearCanvas, canUndo }) => {
  return (
    <header className="note-studio-header">
      <div className="header-left">
        <h1 className="app-title">✨ Note Studio</h1>
        <div
          style={{
            background: getModeColor(mode),
          }}
          className="mode-badge"
        >
          {getModeIcon(mode)} {getModeName(mode)}
        </div>
        <div className="zoom-badge">{Math.round(stageScale * 100)}%</div>
      </div>

      <nav className="header-nav">
        <button onClick={onResetView} className="nav-button reset-btn">
          🎯 Reset View
        </button>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`nav-button undo-btn ${!canUndo ? "disabled" : ""}`}
        >
          ↶ Undo
        </button>
        <button onClick={onClearCanvas} className="nav-button clear-btn">
          🗑️ Clear
        </button>
      </nav>
    </header>
  );
};

export default Header;