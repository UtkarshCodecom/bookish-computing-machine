export const getModeColor = (mode) => {
  switch (mode) {
    case "draw":
      return "linear-gradient(135deg, #10b981, #059669)";
    case "text":
      return "linear-gradient(135deg, #8b5cf6, #7c3aed)";
    case "erase":
      return "linear-gradient(135deg, #ef4444, #dc2626)";
    case "pan":
      return "linear-gradient(135deg, #6366f1, #4f46e5)";
    default:
      return "linear-gradient(135deg, #6366f1, #4f46e5)";
  }
};

export const getModeIcon = (mode) => {
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

export const getModeName = (mode) => {
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

export const formatLineForSave = (line) => ({
  points: line.points || [],
  color: line.color || '#000000',
  size: line.size || 2,
  opacity: line.opacity || 1,
  type: line.type || 'pen'
});

export const formatTextElementForSave = (textEl) => ({
  id: textEl.id,
  x: textEl.x || 0,
  y: textEl.y || 0,
  text: textEl.text || '',
  fontSize: textEl.fontSize || 16,
  fontFamily: textEl.fontFamily || 'Arial',
  fill: textEl.fill || '#000000',
  fontWeight: textEl.fontWeight || 'normal',
  fontStyle: textEl.fontStyle || 'normal',
  width: textEl.width || 300,
  highlight: textEl.highlight || false,
  highlightColor: textEl.highlightColor || '#FFD700'
});