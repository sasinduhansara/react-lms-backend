import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  
  departmentId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },

    name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  description: {
    type: String,
    default: '',
  },

  imageUrl: {
    type: String,
    default: '',
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Cascade delete subjects when department is deleted
departmentSchema.pre('findOneAndDelete', async function (next) {
  const dept = await this.model.findOne(this.getFilter());
  if (dept) {
    await mongoose.model('Subject').deleteMany({ department: dept._id });
  }
  next();
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;
