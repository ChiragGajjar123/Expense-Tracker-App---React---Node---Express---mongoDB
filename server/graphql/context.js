import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const createContext = async ({ req, res }) => {
  let token = req.cookies?.token;

  // Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return { req, res, user: null, userId: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return { req, res, user: null, userId: null };
    }
    return { req, res, user, userId: user._id.toString() };
  } catch (error) {
    console.error('GraphQL Authentication Context Error:', error.message);
    return { req, res, user: null, userId: null };
  }
};
