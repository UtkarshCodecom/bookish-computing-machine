import { useState, useCallback, useRef } from 'react';
import { MODES } from '../utils/constants';
import { isMouseOrTouch } from '../utils/canvasUtils';

const useImageTransform = (stageRef) => {
  const [bgImage, setBgImage] = useState(null);
  const [bgImageProps, setBgImageProps] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1
  });
  const [isImageSelected, setIsImageSelected] = useState(false);
  const bgImageRef = useRef();
  const bgTransformerRef = useRef();

  const handleImageUpload = useCallback((file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          const maxWidth = window.innerWidth * 0.8;
          const maxHeight = (window.innerHeight - 65) * 0.8;
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

          setBgImage(img);
          setBgImageProps({
            x: (window.innerWidth - img.width * scale) / 2,
            y: (window.innerHeight - img.height * scale) / 2,
            width: img.width * scale,
            height: img.height * scale,
            rotation: 0,
            scaleX: 1,
            scaleY: 1
          });
          setIsImageSelected(true);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageTransform = useCallback(() => {
    if (!bgImageRef.current) return;
    
    const node = bgImageRef.current;
    requestAnimationFrame(() => {
      setBgImageProps({
        ...bgImageProps,
        x: node.x(),
        y: node.y(),
        width: Math.max(50, node.width() * node.scaleX()),
        height: Math.max(50, node.height() * node.scaleY()),
        rotation: node.rotation(),
      });
      node.scaleX(1);
      node.scaleY(1);
    });
  }, [bgImageProps]);

  const getTransformerBounds = useCallback((oldBox, newBox) => {
    if (!stageRef.current) return newBox;

    const stage = stageRef.current;
    const ratio = bgImageProps.width / bgImageProps.height;
    const width = Math.max(50, newBox.width);
    const height = width / ratio;
    
    const maxWidth = stage.width() / stage.scaleX();
    const maxHeight = stage.height() / stage.scaleY();
    
    return {
      x: Math.max(0, Math.min(maxWidth - width, newBox.x)),
      y: Math.max(0, Math.min(maxHeight - height, newBox.y)),
      width: Math.min(maxWidth, width),
      height: Math.min(maxHeight, height),
    };
  }, [bgImageProps.width, bgImageProps.height]);

  const clearImage = useCallback(() => {
    setBgImage(null);
    setBgImageProps({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    });
    setIsImageSelected(false);
  }, []);

  const handleImageClick = useCallback((e, setMode) => {
    if (isMouseOrTouch(e)) {
      e.cancelBubble = true;
      setIsImageSelected(true);
      setMode(MODES.PAN);
    }
  }, []);

  return {
    bgImage,
    bgImageProps,
    isImageSelected,
    bgImageRef,
    bgTransformerRef,
    handleImageUpload,
    handleImageTransform,
    getTransformerBounds,
    clearImage,
    handleImageClick,
    setIsImageSelected
  };
};

export default useImageTransform;
