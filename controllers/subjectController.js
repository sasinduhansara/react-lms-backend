import Subject from '../models/subject.js';
import Department from '../models/department.js';
import mongoose from 'mongoose';

//---------------------------Create subject - Admin and Lecturer only---------------------------

export const createSubject = async (req, res) => {
  try {
    // Check if user has permission (admin or lecturer)
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'lecturer')) {
      return res.status(403).json({ 
        error: 'Unauthorized. Only admins and lecturers can create subjects.' 
      });
    }
    
    // Check if the provided department exists
    const department = await Department.findOne({ departmentId: req.body.departmentId });
    
    if (!department) {
      return res.status(404).json({ 
        error: 'Department not found' 
      });
    }
    
    // Create a new subject with department reference
    const subjectData = {
      ...req.body,
      department: department._id  // Set the reference to department ObjectId
    };
    
    const subject = await Subject.create(subjectData);
    
    // Populate the department details in the response
    const populatedSubject = await Subject.findById(subject._id)
      .populate('department', 'departmentId name');
    
    res.status(201).json(populatedSubject);
  } catch (err) {
    // Handle specific validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Subject with this code already exists' 
      });
    }
    
    res.status(400).json({ error: err.message });
  }
};

//---------------------------Get all subjects - Accessible to all authenticated users---------------------------

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('department', 'departmentId name');
    
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get subjects by department - Accessible to all authenticated users
export const getSubjectsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    // Find the department first
    const department = await Department.findOne({ departmentId });
    
    if (!department) {
      return res.status(404).json({ 
        error: 'Department not found' 
      });
    }
    
    // Find subjects that belong to this department
    const subjects = await Subject.find({ department: department._id })
      .populate('department', 'departmentId name');
    
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------Get subjects by department, year and semester - Accessible to all authenticated users---------------------------

export const getSubjectsByYearSem = async (req, res) => {
  try {
    const { departmentId, year, semester } = req.params;
    
    // Find the department first
    const department = await Department.findOne({ departmentId });
    
    if (!department) {
      return res.status(404).json({ 
        error: 'Department not found' 
      });
    }
    
    // Find subjects that belong to this department, year and semester
    const subjects = await Subject.find({ 
      department: department._id,
      year: parseInt(year),
      semester: parseInt(semester)
    }).populate('department', 'departmentId name');
    
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//---------------------------Update subject - Admin and Lecturer only---------------------------

export const updateSubject = async (req, res) => {
  try {
    // Check if user has permission
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'lecturer')) {
      return res.status(403).json({ 
        error: 'Unauthorized. Only admins and lecturers can update subjects.' 
      });
    }
    
    const { subjectCode } = req.params;
    
    // Check if departmentId is being updated
    if (req.body.departmentId) {
      // Verify the department exists
      const department = await Department.findOne({ departmentId: req.body.departmentId });
      
      if (!department) {
        return res.status(404).json({ 
          error: 'Department not found' 
        });
      }
      
      // Update the department reference
      req.body.department = department._id;
    }
    
    const subject = await Subject.findOneAndUpdate(
      { subjectCode },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('department', 'departmentId name');
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(400).json({ error: err.message });
  }
};

//---------------------------Delete subject - Admin and Lecturer only---------------------------

export const deleteSubject = async (req, res) => {
  try {
    // Check if user has permission
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'lecturer')) {
      return res.status(403).json({ 
        error: 'Unauthorized. Only admins and lecturers can delete subjects.' 
      });
    }
    
    const { subjectCode } = req.params;
    
    const subject = await Subject.findOneAndDelete({ subjectCode })
      .populate('department', 'departmentId name');
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json({
      message: 'Subject deleted successfully',
      deletedSubject: subject
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};