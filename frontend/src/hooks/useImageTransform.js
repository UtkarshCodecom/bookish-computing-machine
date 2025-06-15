import { useState, useCallback, useRef, useEffect } from 'react';
import { isMouseOrTouch } from '../utils/canvasUtils';

const useImageTransform = (stageRef) => {
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

  // Attach transformer to image when selected
  useEffect(() => {
    if (isImageSelected && bgImageRef.current && bgTransformerRef.current) {
      bgTransformerRef.current.nodes([bgImageRef.current]);
      bgTransformerRef.current.getLayer().batchDraw();
    }
  }, [isImageSelected, bgImage]);

  const handleImageUpload = useCallback((file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          const maxWidth = window.innerWidth * 0.6;
          const maxHeight = (window.innerHeight - 80) * 0.6;
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

          const width = img.width * scale;
          const height = img.height * scale;

          setBgImage(img);
          setBgImageProps({
            x: (window.innerWidth - width) / 2,
            y: (window.innerHeight - height) / 2,
            width: width,
            height: height,
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
    const newWidth = Math.max(50, node.width() * node.scaleX());
    const newHeight = Math.max(50, node.height() * node.scaleY());
    
    setBgImageProps(prev => ({
      ...prev,
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
    }));
    
    // Reset scale to 1 to avoid compound scaling
    node.scaleX(1);
    node.scaleY(1);
  }, []);

  const getTransformerBounds = useCallback((oldBox, newBox) => {
    const ratio = bgImageProps.width / bgImageProps.height;
    const width = Math.max(50, newBox.width);
    const height = width / ratio;
    
    return {
      x: newBox.x,
      y: newBox.y,
      width: width,
      height: height,
    };
  }, [bgImageProps.width, bgImageProps.height]);

  const clearImage = useCallback(() => {
    setBgImage(null);
    setBgImageProps({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
    setIsImageSelected(false);
  }, []);

  const handleImageClick = useCallback((e) => {
    if (isMouseOrTouch(e)) {
      e.cancelBubble = true;
      setIsImageSelected(true);
    }
  }, []);

  return {
    bgImage,
    setBgImage,
    bgImageProps,
    setBgImageProps,
    isImageSelected,
    setIsImageSelected,
    bgImageRef,
    bgTransformerRef,
    handleImageUpload,
    handleImageTransform,
    getTransformerBounds,
    clearImage,
    handleImageClick
  };
};

export default useImageTransform;