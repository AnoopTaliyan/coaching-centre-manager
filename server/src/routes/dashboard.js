import { Router } from "express";
import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import { wrap } from "../middleware/auth.js";
import { feeStatus, currentMonth } from "./payments.js";
import { today } from "./attendance.js";

const router = Router();

router.get(
  "/",
  wrap(async (req, res) => {
    const month = req.query.month || currentMonth();
    const owner = new mongoose.Types.ObjectId(req.userId);

    const [status, sheets] = await Promise.all([
      feeStatus(req.userId, month),
      Attendance.find({ owner, date: req.query.date || today() }).lean(),
    ]);

    const records = sheets.flatMap(s => s.records);
    const presentToday = records.filter(r => r.present).length;

    res.json({
      month,
      activeStudents: status.length,
      expected: status.reduce((a, s) => a + s.fee, 0),
      collected: status.reduce((a, s) => a + s.paid, 0),
      pending: status.reduce((a, s) => a + s.due, 0),
      defaulters: status.filter(s => s.due > 0).length,
      attendanceToday: records.length
        ? { marked: records.length, present: presentToday, percent: Math.round((presentToday / records.length) * 100) }
        : null,
    });
  })
);

export default router;
