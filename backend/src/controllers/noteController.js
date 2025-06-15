const Note = require('../models/note');

exports.createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        
        // Validate content structure
        if (!content || !Array.isArray(content.lines)) {
            return res.status(400).json({ error: 'Invalid note content structure' });
        }
        
        // Ensure each line in the lines array has the required properties
        const formattedLines = content.lines.map(line => ({
            points: Array.isArray(line.points) ? line.points : [],
            color: line.color || '#000000',
            size: line.size || 2,
            opacity: line.opacity || 1,
            type: line.type || 'pen'
        }));

        const note = new Note({
            title: title || 'Untitled Note',
            content: {
                lines: formattedLines,
                textElements: content.textElements || [],
                stageState: content.stageState || { position: { x: 0, y: 0 }, scale: 1 },
                backgroundImage: content.backgroundImage || null
            },
            user: req.user._id
        });
        
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        console.error('Create note error:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id })
            .sort({ updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateNote = async (req, res) => {
    try {
        const updates = req.body;
        
        // Validate content structure
        if (!updates.content || !Array.isArray(updates.content.lines)) {
            return res.status(400).json({ error: 'Invalid note content structure' });
        }
        
        // Format the lines array to ensure proper structure
        const formattedLines = updates.content.lines.map(line => ({
            points: Array.isArray(line.points) ? line.points : [],
            color: line.color || '#000000',
            size: line.size || 2,
            opacity: line.opacity || 1,
            type: line.type || 'pen'
        }));

        // Ensure proper structure for MongoDB
        const noteData = {
            title: updates.title || 'Untitled Note',
            content: {
                lines: formattedLines,
                textElements: updates.content?.textElements || [],
                stageState: updates.content?.stageState || { position: { x: 0, y: 0 }, scale: 1 },
                backgroundImage: updates.content?.backgroundImage || null
            },
            updatedAt: new Date()
        };
        
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { $set: noteData },
            { new: true, runValidators: true }
        );
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        res.json(note);
    } catch (error) {
        console.error('Update note error:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};