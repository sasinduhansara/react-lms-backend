import Department from '../models/department.js';

//---------------------------Create department - Admin only---------------------------

export const createDepartment = async (req, res) => {
  try {
    // Check if user has permission based on your auth middleware
    // We'll check if req.user exists and has the correct role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Unauthorized. Only admins can create departments.' 
      });
    }
    
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//---------------------------Get all departments - Accessible to all authenticated users---------------------------

export const getAllDepartments = async (req, res) => {
  try {
    const depts = await Department.find();
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//---------------------------Delete department by departmentId - Admin only---------------------------

export const deleteDepartment = async (req, res) => {
  try {
    // Check if user has permission
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Unauthorized. Only admins can delete departments.' 
      });
    }
    
    // Find by departmentId instead of _id
    const { departmentId } = req.params;
    
    const dept = await Department.findOneAndDelete({ departmentId: departmentId });
    
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json({ 
      message: 'Department and related subjects deleted',
      deletedDepartment: dept
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//---------------------------Update department by departmentId - Admin only---------------------------

export const updateDepartment = async (req, res) => {
  try {
    // Check if user has permission
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Unauthorized. Only admins can update departments.' 
      });
    }
    
    // Find by departmentId instead of _id
    const { departmentId } = req.params;
    
    const dept = await Department.findOneAndUpdate(
      { departmentId: departmentId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(dept);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};