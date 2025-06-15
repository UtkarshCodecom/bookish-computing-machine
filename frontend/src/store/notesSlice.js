import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createNote, getNotes, getNote, updateNote, deleteNote } from '../services/api';

// Async thunks
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async () => {
    const response = await getNotes();
    return response.data;
  }
);

export const fetchNoteById = createAsyncThunk(
  'notes/fetchNoteById',
  async (id) => {
    const response = await getNote(id);
    return response.data;
  }
);

export const saveNote = createAsyncThunk(  'notes/saveNote',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Ensure lines array is properly formatted as objects
      const formattedLines = Array.isArray(data.content?.lines) 
        ? data.content.lines.map(line => ({
            points: Array.isArray(line.points) ? line.points : [],
            color: line.color || '#000000',
            size: line.size || 2,
            opacity: line.opacity || 1,
            type: line.type || 'pen'
          }))
        : [];

      // Make sure we have the correct structure that matches the backend model
      const noteData = {
        title: data.title || 'Untitled Note',
        content: {
          lines: formattedLines,
          textElements: data.content?.textElements || [],
          stageState: {
            position: data.content?.stageState?.position || { x: 0, y: 0 },
            scale: data.content?.stageState?.scale || 1
          },
          backgroundImage: data.content?.backgroundImage || null
        }
      };

      let response;
      if (id) {
        response = await updateNote(id, noteData);
      } else {
        response = await createNote(noteData);
      }

      if (!response.data) {
        return rejectWithValue('No data received from server');
      }

      return response.data;
    } catch (err) {
      console.error('Save note error:', err);
      return rejectWithValue(err.response?.data?.error || 'Failed to save note');
    }
  }
);

export const deleteNoteById = createAsyncThunk(
  'notes/deleteNote',
  async (id) => {
    await deleteNote(id);
    return id;
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState: {
    items: [],
    currentNote: null,
    status: 'idle',
    error: null,
    unsavedChanges: false
  },
  reducers: {    updateCurrentNote: (state, action) => {
      if (!state.currentNote) return;
      
      // Handle direct updates to lines and textElements
      if (action.payload.lines !== undefined) {
        state.currentNote.lines = action.payload.lines;
      }
      if (action.payload.textElements !== undefined) {
        state.currentNote.textElements = action.payload.textElements;
      }
      
      // Handle nested content updates
      if (action.payload.content) {
        state.currentNote.content = {
          ...state.currentNote.content || {},
          ...action.payload.content
        };
        // Sync top-level properties with content
        if (action.payload.content.lines) {
          state.currentNote.lines = action.payload.content.lines;
        }
        if (action.payload.content.textElements) {
          state.currentNote.textElements = action.payload.content.textElements;
        }
      }
      
      state.unsavedChanges = true;
    },
    setUnsavedChanges: (state, action) => {
      state.unsavedChanges = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchNoteById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentNote = action.payload;
        state.unsavedChanges = false;
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(saveNote.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentNote = action.payload;
        state.unsavedChanges = false;
        // Update the note in the items array if it exists
        const index = state.items.findIndex(note => note._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(saveNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteNoteById.fulfilled, (state, action) => {
        state.items = state.items.filter(note => note._id !== action.payload);
        if (state.currentNote?._id === action.payload) {
          state.currentNote = null;
        }
      });
  }
});

export const { updateCurrentNote, setUnsavedChanges } = notesSlice.actions;
export default notesSlice.reducer;
