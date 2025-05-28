import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update timestamps
newsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });

const News = mongoose.model('News', newsSchema);
export default News;
