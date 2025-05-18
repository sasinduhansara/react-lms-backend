import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  // Subject identifier
  subjectCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  
  // Subject name
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Department reference using ObjectId
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  
  // Department ID (for easier querying)
  departmentId: {
    type: String,
    required: true,
    uppercase: true
  },
  
  // Academic details
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4], // 1st, 2nd, 3rd, 4th year
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not a valid year'
    }
  },
  
  semester: {
    type: Number,
    required: true,
    enum: [1, 2], // Semester 1 or 2
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not a valid semester'
    }
  },
  
  // Subject details
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  
  description: {
    type: String,
    default: ''
  },
  
  // Optional learning outcomes
  learningOutcomes: {
    type: [String],
    default: []
  },
  
  // Optional syllabus outline
  syllabus: {
    type: String,
    default: ''
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for department, year and semester (for efficient querying)
subjectSchema.index({ department: 1, year: 1, semester: 1 });

// Pre-save middleware to update timestamps
subjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;