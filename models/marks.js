import mongoose from "mongoose";

const markSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    departmentId: {
      type: String,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    assignmentMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    examMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalMarks: {
      type: Number,
      default: function () {
        return this.assignmentMarks + this.examMarks;
      },
    },
    grade: {
      type: String,
      enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"],
    },
    semester: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    year: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4],
    },
    academicYear: {
      type: String,
      required: true,
      default: function () {
        return new Date().getFullYear().toString();
      },
    },
    addedBy: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate total and grade
markSchema.pre("save", function (next) {
  this.totalMarks = this.assignmentMarks + this.examMarks;

  const total = this.totalMarks;
  if (total >= 180) this.grade = "A+";
  else if (total >= 160) this.grade = "A";
  else if (total >= 150) this.grade = "A-";
  else if (total >= 140) this.grade = "B+";
  else if (total >= 130) this.grade = "B";
  else if (total >= 120) this.grade = "B-";
  else if (total >= 110) this.grade = "C+";
  else if (total >= 100) this.grade = "C";
  else if (total >= 90) this.grade = "C-";
  else if (total >= 80) this.grade = "D+";
  else if (total >= 70) this.grade = "D";
  else this.grade = "F";

  next();
});

const Mark = mongoose.model("Mark", markSchema);
export default Mark;
