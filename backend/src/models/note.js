const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Untitled Note'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  content: {
    lines: [{
      points: [Number],
      color: String,
      size: Number,
      opacity: Number,
      type: String
    }],
    textElements: [{
      id: String,
      x: Number,
      y: Number,
      text: String,
      fontSize: Number,
      fontFamily: String,
      fill: String,
      width: Number,
      fontStyle: String,
      fontWeight: String,
      highlight: Boolean,
      highlightColor: String
    }],
    stageState: {
      position: {
        x: Number,
        y: Number
      },
      scale: Number
    },
    backgroundImage: {
      dataUrl: String,
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
