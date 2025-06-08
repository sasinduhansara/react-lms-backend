import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    departmentId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Cascade delete subjects when department is deleted
departmentSchema.pre("findOneAndDelete", async function (next) {
  try {
    const dept = await this.model.findOne(this.getFilter());
    if (dept) {
      await mongoose.model("Subject").deleteMany({ department: dept._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Also handle regular deleteOne
departmentSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      await mongoose.model("Subject").deleteMany({ department: this._id });
      next();
    } catch (error) {
      next(error);
    }
  }
);

// Update the updatedAt field on save
departmentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Department = mongoose.model("Department", departmentSchema);
export default Department;
