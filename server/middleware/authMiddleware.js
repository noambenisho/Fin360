// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    const raw = req.header('Authorization') || '';
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : null;

    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // השרת חותם טוקן בפורמט: { id: <userId> }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ננרמל את המבנה שזמין הלאה בבקשה
    req.user = { id: decoded.id };

    return next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

export default authMiddleware;
