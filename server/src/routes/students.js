import { Router } from "express";
import Student from "../models/Student.js";
import { wrap } from "../middleware/auth.js";

const router = Router();
const FIELDS = ["name", "phone", "parentPhone", "batch", "monthlyFee", "joinDate", "active"];
const pick = body => Object.fromEntries(FIELDS.filter(f => body[f] !== undefined).map(f => [f, body[f]]));

// GET /api/students?batch=A&active=true&q=rahul
router.get(
  "/",
  wrap(async (req, res) => {
    const filter = { owner: req.userId };
    if (req.query.batch) filter.batch = req.query.batch;
    if (req.query.active !== undefined) filter.active = req.query.active === "true";
    if (req.query.q) filter.name = { $regex: req.query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    res.json(await Student.find(filter).sort({ batch: 1, name: 1 }));
  })
);

router.get(
  "/batches",
  wrap(async (req, res) => {
    res.json((await Student.distinct("batch", { owner: req.userId, active: true })).sort());
  })
);

router.post(
  "/",
  wrap(async (req, res) => {
    const student = await Student.create({ ...pick(req.body), owner: req.userId });
    res.status(201).json(student);
  })
);

router.put(
  "/:id",
  wrap(async (req, res) => {
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      pick(req.body),
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  })
);

router.delete(
  "/:id",
  wrap(async (req, res) => {
    // soft delete keeps payment history intact
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { active: false },
      { new: true }
    );
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ ok: true });
  })
);

export default router;
