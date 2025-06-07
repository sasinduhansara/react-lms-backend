import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    imagePath: {
      type: String,
      default: "",
      trim: true,
    },
    author: {
      type: String,
      default: "Admin",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
newsSchema.index({ title: 1, createdAt: -1 });

const News = mongoose.model("News", newsSchema);
export default News;
