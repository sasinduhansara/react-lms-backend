// middleware/auth.js
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user info to request object
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Admin only middleware
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Self or Admin middleware (for user profile operations)
export const requireSelfOrAdmin = (req, res, next) => {
    const targetUserId = req.params.userId;
    const requestingUserId = req.user.userId;
    const requestingUserRole = req.user.role;

    if (requestingUserRole === 'admin' || requestingUserId === targetUserId) {
        next();
    } else {
        return res.status(403).json({ 
            message: 'You can only access your own data or be an admin' 
        });
    }
};