import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import paymentRoutes from "./routes/payments.js";
import attendanceRoutes from "./routes/attendance.js";
import dashboardRoutes from "./routes/dashboard.js";
import { requireAuth } from "./middleware/auth.js";

const app = express();

const allowed = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map(s => s.trim());
app.use(cors({ origin: allowed }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/students", requireAuth, studentRoutes);
app.use("/api/payments", requireAuth, paymentRoutes);
app.use("/api/attendance", requireAuth, attendanceRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);

// central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
