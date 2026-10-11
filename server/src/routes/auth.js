import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { wrap } from "../middleware/auth.js";

const router = Router();

const sign = user =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = u => ({ id: u._id, centreName: u.centreName, email: u.email });

router.post(
  "/register",
  wrap(async (req, res) => {
    const { centreName, email, password } = req.body;
    if (!centreName || !email || !password) {
      return res.status(400).json({ error: "Centre name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ error: "This email is already registered" });
    }
    const user = await User.create({
      centreName,
      email,
      passwordHash: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  })
);

router.post(
  "/login",
  wrap(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
      return res.status(401).json({ error: "Wrong email or password" });
    }
    res.json({ token: sign(user), user: publicUser(user) });
  })
);

export default router;
