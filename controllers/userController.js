import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// user registration
export const registerUser = async (req, res) => {
  const { firstName,lastName, email, password, role } = req.body;
  const passHash = bcrypt.hashSync(password, 10);
  const newUser = new User({
    firstName,
    lastName,
    email,
    passwordHash: passHash,
    role
  });
  try { 
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
    
  } catch (error) { 
    console.log(error);
    
  }

}

// user login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email:email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    
    const isMatch = bcrypt.compareSync(password, user.passwordHash);

    if (!isMatch) {
      res.status(400).json({ message: 'Invalid password' });

    }else{
      const payload = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

      return res.status(200).json({ massage : 'Login successful', token:token, user:user});
    }

  
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


