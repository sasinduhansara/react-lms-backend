import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    totalParts: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    uploadedParts: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ["video", "pdf"],
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    author: {
      type: String,
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
lessonSchema.index({ title: 1, department: 1, subject: 1 });

const Lesson = mongoose.model("Lesson", lessonSchema);
export default Lesson;
