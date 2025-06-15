import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getModeColor, getModeIcon, getModeName } from '../../utils/drawingUtils';

const Header = ({ 
  mode, 
  stageScale, 
  onResetView, 
  onUndo, 
  onClearCanvas, 
  onSave,
  canUndo, 
  unsavedChanges,
  onImageUpload,
  noteTitle
}) => {
  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <header className="note-studio-header">
      <div className="header-left">
        <button 
          onClick={() => navigate('/')}
          className="back-button"
        >
          ← Back
        </button>
        <h1 className="app-title">✨ {noteTitle || 'Note Studio'}</h1>
        <div
          style={{ background: getModeColor(mode) }}
          className="mode-badge"
        >
          {getModeIcon(mode)} {getModeName(mode)}
        </div>
        <div className="zoom-badge">{Math.round(stageScale * 100)}%</div>
        {unsavedChanges && (
          <div className="unsaved-indicator">
            <span className="unsaved-dot">●</span>
            <span className="unsaved-text">Unsaved changes</span>
          </div>
        )}
      </div>

      <nav className="header-nav">
        <button 
          onClick={onSave}
          disabled={!unsavedChanges}
          className={`nav-button save-btn ${!unsavedChanges ? 'disabled' : ''}`}
        >
          💾 Save
        </button>
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
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
          id="image-upload"
        />
        <label htmlFor="image-upload" className="nav-button image-btn">
          🖼️ Add Image
        </label>
      </nav>
    </header>
  );
};

export default Header;