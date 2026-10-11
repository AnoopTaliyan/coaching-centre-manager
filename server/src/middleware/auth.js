import jwt from "jsonwebtoken";

// Every logged-in user is one coaching centre; req.userId scopes all data.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Login required" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: "Session expired, please log in again" });
  }
}

// Wrap async route handlers so errors reach the error middleware
export const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
