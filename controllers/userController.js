// userController.js - Full controller with all functions
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//--------------------------- user registration--------------------------- 

export const registerUser = async (req, res) => {



    const { userId, firstName, lastName, department, email, password, role } = req.body;
    const passHash = bcrypt.hashSync(password, 10);
    const newUser = new User({
      userId,
      firstName,
      lastName,
      department,
      email,
      passwordHash: passHash,
      role
    });

    try {
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });

    } 

    catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Registration failed', error: error.message });
    }

};


//--------------------------- user login--------------------------- 

export const loginUser = async (req, res) => {

  // check email and password in the request body
  const { email, password } = req.body;

  // check if email and password are provided
  try {
    const user = await User.findOne({ email: email });
    
    if (!user)
      return res.status(400).json({
        message: 'User not found'
      });
    
    // check if password is provided  
    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid password' });
    } else {
      const payload = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        email: user.email,
        role: user.role
      };
      
      // Generate JWT token
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
      
      return res.status(200).json({ massage: 'Login successful', token: token, user: user });
    }

    // check if user is an admin
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//--------------------------- delete user by email--------------------------- 

export const deleteUserByEmail = async (req, res) => {
  try {
    // check role of the requesting user
    const requestingUserRole = req.user.role;
    
    // check if the requesting user is an admin
    if (requestingUserRole !== 'admin') {
      return res.status(403).json({
        message: "Unauthorized. Only admins can delete users."
      });
    }
    
    // check user email in the request body
    const email = req.body.email;
    
    if (!email) {
      return res.status(400).json({
        message: "Email is required in the request body",
      });
    }
    
    const targetUser = await User.findOne({ email: email });
    
    if (!targetUser) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }
    
    const result = await User.deleteOne({ email: email });
    
    if (result.deletedCount === 0) {
      res.status(404).json({
        message: "User Not Found",
      });
    } else {
      res.status(200).json({
        message: "User Deleted Successfully",
        result,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "User Deletion Failed",
      error: error.message,
    });
  }
};

//--------------------------- update user --------------------------- 

export const updateUser = async (req, res) => {
  try {
    // Check if the requesting user is authorized (must be admin or the same user)
    const requestingUserRole = req.user.role;
    const requestingUserEmail = req.user.email;
    const targetUserEmail = req.body.currentEmail || req.params.email;
    
    // Only allow updates if user is updating their own account or is an admin
    if (requestingUserRole !== 'admin' && requestingUserEmail !== targetUserEmail) {
      return res.status(403).json({
        message: "Unauthorized. You can only update your own account or be an admin to update others."
      });
    }
    
    // Find the user to update
    const user = await User.findOne({ email: targetUserEmail });
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    
    // Extract update fields from request body
    const { userId, firstName, lastName, departmentId, email, password, role } = req.body;
    
    // Only allow role updates if the requesting user is an admin
    if (role && requestingUserRole !== 'admin') {
      return res.status(403).json({
        message: "Unauthorized. Only admins can update roles."
      });
    }
    
    // Update user fields if provided
    if (userId) user.userId = userId;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (departmentId) user.department = department;
    if (email) user.email = email;
    if (password) user.passwordHash = bcrypt.hashSync(password, 10);
    if (role && requestingUserRole === 'admin') user.role = role;
    
    // Save the updated user
    const updatedUser = await user.save();
    
    // Return success response without sending password hash
    res.status(200).json({
      message: "User updated successfully",
      user: {
        userId: updatedUser.userId,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        department: updatedUser.department,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
    
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "User update failed",
      error: error.message
    });
  }
};


//--------------------------- get all user by email ---------------------------

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: "Unauthorized. Only admins can view all users."
      });
    }
    
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    });
  }
};



