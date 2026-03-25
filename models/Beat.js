const mongoose = require('mongoose');

const beatSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  producer: { type: String, required: true, trim: true },
  genre: { type: String, required: true, enum: ['Hip-Hop', 'Trap', 'R&B', 'Drill', 'Lo-Fi', 'Afrobeats', 'Pop', 'Other'] },
  bpm: { type: Number, required: true, min: 60, max: 300 },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true },
  tags: [{ type: String }],
  audioUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '/images/default-cover.svg' },
  mood: { type: String, enum: ['Dark', 'Energetic', 'Chill', 'Emotional', 'Aggressive', 'Uplifting', 'Other'], default: 'Other' },
  key: { type: String, default: 'Unknown' },
  plays: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  license: { type: String, enum: ['Basic', 'Premium', 'Exclusive'], default: 'Basic' },
  createdAt: { type: Date, default: Date.now }
});

beatSchema.index({ title: 'text', producer: 'text', tags: 'text' });

module.exports = mongoose.model('Beat', beatSchema);
