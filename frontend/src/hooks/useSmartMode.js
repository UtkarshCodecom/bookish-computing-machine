import { useState, useCallback, useEffect } from 'react';
import { isPenInput, isMouseOrTouch, isStylusEraser } from '../utils/canvasUtils';
import { MODES } from '../utils/constants';

const useSmartMode = (initialMode = 'draw') => {
  const [mode, setMode] = useState(initialMode);
  const [lastPenMode, setLastPenMode] = useState('draw');
  const [lastMouseMode, setLastMouseMode] = useState('pan');

  const handleInputDeviceChange = useCallback((e) => {
    const isPen = isPenInput(e);
    
    if (isPen) {
      setLastMouseMode(mode); // Save current mode if it was set by mouse
      setMode(lastPenMode); // Restore last pen mode
    } else if (isMouseOrTouch(e)) {
      setLastPenMode(mode); // Save current mode if it was set by pen
      setMode(lastMouseMode); // Restore last mouse mode
    }
  }, [mode, lastPenMode, lastMouseMode]);

  const setModeWithMemory = useCallback((newMode) => {
    // When explicitly setting a mode, update the corresponding memory
    if (isPenInput(window.event)) {
      setLastPenMode(newMode);
    } else {
      setLastMouseMode(newMode);
    }
    setMode(newMode);
  }, []);

  return {
    mode,
    setMode: setModeWithMemory,
    handleInputDeviceChange,
    isPenMode: mode === 'draw' || mode === 'erase',
    isMouseMode: mode === 'pan' || mode === 'text',
  };
};

export default useSmartMode;
