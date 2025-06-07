import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["pdf", "video", "image", "document", "other", "jpg", "png"],
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  size: {
    type: Number, // in bytes
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

materialSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Material = mongoose.model("Material", materialSchema);
export default Material;
