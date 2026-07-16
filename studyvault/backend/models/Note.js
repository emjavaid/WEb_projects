const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: Number, required: true, min: 1, max: 5 },
});

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: {
      type: String,
      required: true,
      enum: ['Computer Science', 'Mathematics', 'Physics', 'English', 'Economics', 'Other'],
    },
    description: { type: String, required: true },
    content: { type: String, required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploaderName: { type: String, required: true },
    tags: [{ type: String }],
    downloads: { type: Number, default: 0 },
    ratings: [ratingSchema],
    comments: [commentSchema],
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: average rating
noteSchema.virtual('averageRating').get(function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
});

noteSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Note', noteSchema);
