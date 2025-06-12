import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  subjectName: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  departmentId: {
    type: String,
    required: true,
    uppercase: true,
  },
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not a valid year",
    },
  },
  semester: {
    type: Number,
    required: true,
    enum: [1, 2],
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not a valid semester",
    },
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  // ADDED LECTURER FIELD
  lecturer: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    default: "",
  },
  learningOutcomes: {
    type: [String],
    default: [],
  },
  syllabus: {
    type: String,
    default: "",
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

subjectSchema.index({ department: 1, year: 1, semester: 1 });

subjectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
