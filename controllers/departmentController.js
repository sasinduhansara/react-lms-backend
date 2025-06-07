import Department from '../models/department.js';

// Create a new department
export const createDepartment = async (req, res) => {
  try {
    const { departmentId, name } = req.body;

    // Validate input
    if (!departmentId || !name) {
      return res.status(400).json({
        error: 'Department ID and Name are required'
      });
    }

    // Case-insensitive check
    const existing = await Department.findOne({
      $or: [
        { departmentId: { $regex: new RegExp(`^${departmentId}$`, 'i') }},
        { name: { $regex: new RegExp(`^${name}$`, 'i') }}
      ]
    });

    if (existing) {
      const conflictField = 
        existing.departmentId.toLowerCase() === departmentId.toLowerCase()
          ? 'Department ID'
          : 'Department name';
      return res.status(400).json({
        error: `${conflictField} already exists`
      });
    }

    // Create with formatted values
    const dept = await Department.create({
      departmentId: departmentId.toUpperCase(),
      name: name.trim(),
      description: req.body.description?.trim() || '',
      imageUrl: req.body.imageUrl?.trim() || ''
    });

    res.status(201).json(dept);
    
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate value detected'
      });
    }
    res.status(400).json({
      error: err.message || 'Creation failed'
    });
  }
};

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.status(200).json(departments);
  } catch (err) {
    res.status(500).json({
      error: err.message || 'Failed to fetch departments'
    });
  }
};

// Get single department by departmentId
export const getDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    const department = await Department.findOne({ 
      departmentId: departmentId.toUpperCase() 
    });
    
    if (!department) {
      return res.status(404).json({
        error: 'Department not found'
      });
    }
    
    res.status(200).json(department);
  } catch (err) {
    res.status(500).json({
      error: err.message || 'Failed to fetch department'
    });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const updates = req.body;

    // Remove departmentId from updates (shouldn't be changed)
    delete updates.departmentId;

    // If name is being updated, check for duplicates
    if (updates.name) {
      const existing = await Department.findOne({
        name: { $regex: new RegExp(`^${updates.name}$`, 'i') },
        departmentId: { $ne: departmentId.toUpperCase() }
      });

      if (existing) {
        return res.status(400).json({
          error: 'Department name already exists'
        });
      }
      updates.name = updates.name.trim();
    }

    // Trim other string fields
    if (updates.description) updates.description = updates.description.trim();
    if (updates.imageUrl) updates.imageUrl = updates.imageUrl.trim();
    
    // Update timestamp
    updates.updatedAt = new Date();

    const department = await Department.findOneAndUpdate(
      { departmentId: departmentId.toUpperCase() },
      updates,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        error: 'Department not found'
      });
    }

    res.status(200).json(department);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate value detected'
      });
    }
    res.status(400).json({
      error: err.message || 'Update failed'
    });
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    console.log(`Deleting department with ID: ${departmentId}`);

    const department = await Department.findOneAndDelete({
      departmentId: departmentId.toUpperCase()
    });

    console.log(`Department found: ${department }`);

    if (!department) {
      return res.status(404).json({
        error: 'Department not found'
      });
    }

    res.status(200).json({
      message: 'Department deleted successfully',
      deletedDepartment: department
    });
  } catch (err) {
    res.status(500).json({
      error: err.message || 'Delete failed'
    });
  }
};
