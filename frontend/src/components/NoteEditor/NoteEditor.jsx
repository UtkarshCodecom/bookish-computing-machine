import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchNoteById, saveNote, updateCurrentNote } from "../../store/notesSlice";
import { toast } from 'react-toastify';
import { debounce } from "lodash";
import Canvas from "./Canvas";
import FloatingMenu from "./FloatingMenu";
import Header from "./Header";
import TextEditor from "./TextEditor";
import useDrawing from "../../hooks/useDrawing";
import useTextEditor from "../../hooks/useTextEditor";
import useStageTransform from "../../hooks/useStageTransform";
import useImageTransform from "../../hooks/useImageTransform";
import "./NoteEditor.css";

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentNote, status, unsavedChanges } = useSelector(state => state.notes);
  
  const stageRef = useRef();
  const [mode, setMode] = useState("draw");
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Custom hooks
  const drawing = useDrawing(stageRef);
  const textEditor = useTextEditor(stageRef);
  const stageTransform = useStageTransform(stageRef);
  const imageTransform = useImageTransform(stageRef);

  // Load note data
  useEffect(() => {
    if (id) {
      dispatch(fetchNoteById(id));
    }
  }, [id, dispatch]);

  // Initialize note data when loaded
  useEffect(() => {
    if (currentNote && id) {
      const lines = currentNote.lines || currentNote.content?.lines || [];
      const textElements = currentNote.textElements || currentNote.content?.textElements || [];
      
      drawing.setLines(lines);
      textEditor.setTextElements(textElements);
      
      // Load background image if exists
      const bgImageData = currentNote.backgroundImage || currentNote.content?.backgroundImage;
      if (bgImageData && bgImageData.dataUrl) {
        const img = new window.Image();
        img.onload = () => {
          imageTransform.setBgImage(img);
          imageTransform.setBgImageProps(bgImageData);
        };
        img.src = bgImageData.dataUrl;
      }
      
      setLoading(false);
    }
  }, [currentNote, id]);

  // Auto-save functionality
  const debouncedSave = useCallback(
    debounce(async (data) => {
      if (!currentNote?._id) return;
      
      try {
        await dispatch(saveNote({
          id: currentNote._id,
          data: {
            title: currentNote.title || 'Untitled Note',
            content: {
              lines: data.lines.map(line => ({
                points: line.points,
                color: line.color || '#000000',
                size: line.size || 2,
                opacity: line.opacity || 1,
                type: line.type || 'pen'
              })),
              textElements: data.textElements,
              stageState: {
                position: data.stagePosition,
                scale: data.stageScale
              },
              backgroundImage: data.bgImage ? {
                dataUrl: data.bgImage.src,
                ...data.bgImageProps
              } : null
            }
          }
        })).unwrap();
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 2000),
    [dispatch, currentNote]
  );

  // Update store when data changes
  useEffect(() => {
    if (drawing.lines.length > 0 || textEditor.textElements.length > 0) {
      const updateData = {
        lines: drawing.lines,
        textElements: textEditor.textElements,
        stagePosition: stageTransform.stagePosition,
        stageScale: stageTransform.stageScale,
        bgImage: imageTransform.bgImage,
        bgImageProps: imageTransform.bgImageProps
      };
      
      dispatch(updateCurrentNote({
        content: {
          lines: updateData.lines,
          textElements: updateData.textElements,
          stageState: {
            position: updateData.stagePosition,
            scale: updateData.stageScale
          }
        }
      }));

      debouncedSave(updateData);
    }
  }, [
    drawing.lines,
    textEditor.textElements,
    stageTransform.stagePosition,
    stageTransform.stageScale,
    imageTransform.bgImage,
    imageTransform.bgImageProps,
    debouncedSave,
    dispatch
  ]);

  const handleSave = async () => {
    if (!currentNote?._id) return;
    
    try {
      await dispatch(saveNote({
        id: currentNote._id,
        data: {
          title: currentNote.title || 'Untitled Note',
          content: {
            lines: drawing.lines.map(line => ({
              points: line.points,
              color: line.color || '#000000',
              size: line.size || 2,
              opacity: line.opacity || 1,
              type: line.type || 'pen'
            })),
            textElements: textEditor.textElements,
            stageState: {
              position: stageTransform.stagePosition,
              scale: stageTransform.stageScale
            },
            backgroundImage: imageTransform.bgImage ? {
              dataUrl: imageTransform.bgImage.src,
              ...imageTransform.bgImageProps
            } : null
          }
        }
      })).unwrap();
      
      toast.success('Note saved successfully!');
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save note');
    }
  };

  const handleClearCanvas = () => {
    drawing.clearCanvas();
    textEditor.clearText();
    imageTransform.clearImage();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your note...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Note</h2>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Back to Notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor-container">
      <Header
        mode={mode}
        stageScale={stageTransform.stageScale}
        onResetView={stageTransform.resetView}
        onUndo={drawing.undo}
        onClearCanvas={handleClearCanvas}
        onSave={handleSave}
        canUndo={drawing.canUndo}
        unsavedChanges={unsavedChanges}
        onImageUpload={imageTransform.handleImageUpload}
        noteTitle={currentNote?.title}
      />

      <div className="note-editor-content">
        <Canvas
          stageRef={stageRef}
          mode={mode}
          drawing={drawing}
          textEditor={textEditor}
          stageTransform={stageTransform}
          imageTransform={imageTransform}
        />

        <FloatingMenu
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          mode={mode}
          setMode={setMode}
          drawing={drawing}
          textEditor={textEditor}
        />

        <TextEditor textEditor={textEditor} />
      </div>
    </div>
  );
};

export default NoteEditor;