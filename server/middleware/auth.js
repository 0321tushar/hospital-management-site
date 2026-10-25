import { verifyToken } from '../utils/jwt.js';

// Require authenticated JWT token
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access Denied: Missing or invalid authorization token',
      requiresAuth: true
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      error: 'Session Expired or Invalid Token. Please re-authenticate.',
      requiresAuth: true
    });
  }

  req.user = decoded;
  next();
};

// Require specific user roles (e.g. Admin, Doctor)
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: This action requires one of the following roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

// Optional auth: attaches user if token is provided, without blocking if public
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) req.user = decoded;
  }
  next();
};
