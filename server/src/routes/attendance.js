import { Router } from "express";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import { wrap } from "../middleware/auth.js";

const router = Router();
export const today = () => new Date().toISOString().slice(0, 10);

// GET /api/attendance?date=2026-10-11&batch=A
// Returns every active student of the batch with their present flag for that day.
router.get(
  "/",
  wrap(async (req, res) => {
    const date = req.query.date || today();
    const { batch } = req.query;
    if (!batch) return res.status(400).json({ error: "batch is required" });

    const [students, sheet] = await Promise.all([
      Student.find({ owner: req.userId, batch, active: true }).sort({ name: 1 }).lean(),
      Attendance.findOne({ owner: req.userId, date, batch }).lean(),
    ]);
    const marked = new Map((sheet?.records || []).map(r => [String(r.student), r.present]));
    res.json({
      date,
      batch,
      saved: Boolean(sheet),
      records: students.map(s => ({ student: s, present: marked.get(String(s._id)) ?? false })),
    });
  })
);

// POST /api/attendance  { date, batch, records: [{ student, present }] }
router.post(
  "/",
  wrap(async (req, res) => {
    const { date = today(), batch, records = [] } = req.body;
    if (!batch) return res.status(400).json({ error: "batch is required" });
    const sheet = await Attendance.findOneAndUpdate(
      { owner: req.userId, date, batch },
      { records: records.map(r => ({ student: r.student, present: Boolean(r.present) })) },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(sheet);
  })
);

// GET /api/attendance/student/:id  -> attendance % for one student
router.get(
  "/student/:id",
  wrap(async (req, res) => {
    const student = await Student.findOne({ _id: req.params.id, owner: req.userId }).lean();
    if (!student) return res.status(404).json({ error: "Student not found" });
    const sheets = await Attendance.find({ owner: req.userId, "records.student": student._id }).lean();
    const total = sheets.length;
    const present = sheets.filter(s =>
      s.records.find(r => String(r.student) === String(student._id))?.present
    ).length;
    res.json({ total, present, percent: total ? Math.round((present / total) * 100) : null });
  })
);

export default router;
