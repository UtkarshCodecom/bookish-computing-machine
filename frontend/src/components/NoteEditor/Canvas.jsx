import React from "react";
import { Stage, Layer, Line, Text, Transformer, Image, Rect } from "react-konva";

const Canvas = ({ 
  stageRef, 
  mode, 
  drawing, 
  textEditor, 
  stageTransform, 
  imageTransform 
}) => {
  const handlePointerDown = (e) => {
    const isTextElement = e.target.getAttr("id")?.startsWith("text-");
    if (isTextElement) return;

    drawing.handlePointerDown(e, mode);
    textEditor.handleStageClick(e, mode);
  };

  const handlePointerMove = (e) => {
    drawing.handlePointerMove(e, mode);
  };

  const handlePointerUp = (e) => {
    drawing.handlePointerUp(e, mode);
  };

  const drawGrid = () => {
    const gridSize = 20;
    const points = [];

    if (!stageRef.current) return points;

    const stage = stageRef.current;
    const scale = stage.scaleX();
    const pos = stage.position();

    const viewLeft = -pos.x / scale;
    const viewTop = -pos.y / scale;
    const viewWidth = window.innerWidth / scale;
    const viewHeight = (window.innerHeight - 80) / scale;

    const padWidth = viewWidth;
    const padHeight = viewHeight;

    const startX = Math.floor((viewLeft - padWidth) / gridSize) * gridSize;
    const endX = Math.ceil((viewLeft + viewWidth + padWidth) / gridSize) * gridSize;
    const startY = Math.floor((viewTop - padHeight) / gridSize) * gridSize;
    const endY = Math.ceil((viewTop + viewHeight + padHeight) / gridSize) * gridSize;

    for (let i = startY; i <= endY; i += gridSize) {
      points.push([startX, i, endX, i]);
    }

    for (let i = startX; i <= endX; i += gridSize) {
      points.push([i, startY, i, endY]);
    }

    return points;
  };

  const gridLines = React.useMemo(() => drawGrid(), [
    stageTransform.stagePosition.x,
    stageTransform.stagePosition.y,
    stageTransform.stageScale
  ]);

  return (
    <div className="canvas-container">
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight - 80}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onWheel={stageTransform.handleWheel}
        onDragEnd={stageTransform.handleDragEnd}
        draggable={
          mode === "pan" &&
          !textEditor.selectedTextId &&
          !drawing.isDrawing &&
          !textEditor.isDraggingText &&
          !textEditor.isEditingText
        }
        x={stageTransform.stagePosition.x}
        y={stageTransform.stagePosition.y}
        scaleX={stageTransform.stageScale}
        scaleY={stageTransform.stageScale}
        className={`canvas-stage mode-${mode}`}
      >
        {/* Background Layer */}
        <Layer>
          <Rect
            x={-5000}
            y={-5000}
            width={10000}
            height={10000}
            fill="#ffffff"
            listening={false}
          />
        </Layer>

        {/* Grid Layer */}
        <Layer>
          {gridLines.map((points, i) => (
            <Line
              key={`grid-${i}`}
              points={points}
              stroke="#f0f0f0"
              strokeWidth={1}
              listening={false}
            />
          ))}
        </Layer>

        {/* Image Layer */}
        <Layer>
          {imageTransform.bgImage && (
            <>
              <Image
                ref={imageTransform.bgImageRef}
                image={imageTransform.bgImage}
                x={imageTransform.bgImageProps.x}
                y={imageTransform.bgImageProps.y}
                width={imageTransform.bgImageProps.width}
                height={imageTransform.bgImageProps.height}
                draggable={true}
                onClick={(e) => imageTransform.handleImageClick(e, () => {})}
                onDragEnd={(e) => {
                  imageTransform.setBgImageProps({
                    ...imageTransform.bgImageProps,
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
                onTransformEnd={imageTransform.handleImageTransform}
              />
              {imageTransform.isImageSelected && (
                <Transformer
                  ref={imageTransform.bgTransformerRef}
                  boundBoxFunc={imageTransform.getTransformerBounds}
                  enabledAnchors={[
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                  ]}
                  rotateEnabled={false}
                />
              )}
            </>
          )}
        </Layer>

        {/* Drawing Layer */}
        <Layer>
          {drawing.lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color || "#000000"}
              strokeWidth={line.size || 2}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation="source-over"
              opacity={line.opacity || 1}
            />
          ))}

          {drawing.currentLine && (
            <Line
              points={drawing.currentLine.points}
              stroke={drawing.currentLine.color}
              strokeWidth={drawing.currentLine.size}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation="source-over"
              opacity={drawing.currentLine.opacity}
            />
          )}

          {textEditor.textElements.map((textEl) => (
            <React.Fragment key={textEl.id}>
              {textEl.highlight && (
                <Rect
                  x={textEl.x - 2}
                  y={textEl.y - 2}
                  width={textEl.width + 4}
                  height={textEl.fontSize + 4}
                  fill={textEl.highlightColor}
                  listening={false}
                />
              )}

              <Text
                id={`text-${textEl.id}`}
                x={textEl.x}
                y={textEl.y}
                text={textEl.text}
                width={textEl.width}
                fontSize={textEl.fontSize}
                fontFamily={textEl.fontFamily}
                fill={textEl.fill}
                fontStyle={textEl.fontStyle}
                fontWeight={textEl.fontWeight}
                draggable={!textEditor.isEditingText}
                onDragStart={() => textEditor.handleTextDragStart(textEl.id)}
                onDragEnd={(e) => textEditor.handleTextDragEnd(textEl.id, e)}
                onClick={(e) => {
                  e.cancelBubble = true;
                  textEditor.handleTextClick(textEl);
                }}
                onDblClick={(e) => {
                  e.cancelBubble = true;
                  textEditor.handleTextDblClick(textEl);
                }}
                visible={textEditor.editingTextId !== textEl.id}
                listening={!textEditor.isEditingText}
              />
            </React.Fragment>
          ))}

          {textEditor.selectedTextId && (
            <Transformer
              ref={textEditor.transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                const minWidth = 50;
                return {
                  ...newBox,
                  width: Math.max(minWidth, newBox.width),
                };
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;