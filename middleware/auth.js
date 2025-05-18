
// middleware/auth.js
import jwt from 'jsonwebtoken';

// JWT token verify 
// Check if your authenticate middleware adds the user's role to req.user
export const authenticate = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Does decoded contain the user's role?
      req.user = decoded; // This should include { role: 'admin' or 'user', ... }
      
      next();
    } catch (err) {
      res.status(401).json({ error: 'Token is not valid' });
    }
  };