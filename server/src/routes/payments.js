import { Router } from "express";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { wrap } from "../middleware/auth.js";
import { currentMonth } from "../utils/dates.js";

const router = Router();
export { currentMonth };

// Short, human-friendly receipt number derived from the payment id
export const receiptNo = p => "R-" + String(p._id).slice(-6).toUpperCase();

// Fee status of every active student for a month
export async function feeStatus(ownerId, month) {
  const owner = new mongoose.Types.ObjectId(ownerId);
  const [students, paid] = await Promise.all([
    Student.find({ owner, active: true }).sort({ batch: 1, name: 1 }).lean(),
    Payment.aggregate([
      { $match: { owner, month } },
      { $group: { _id: "$student", total: { $sum: "$amount" } } },
    ]),
  ]);
  const paidMap = new Map(paid.map(p => [String(p._id), p.total]));
  return students.map(s => {
    const paidAmt = paidMap.get(String(s._id)) || 0;
    return { student: s, fee: s.monthlyFee, paid: paidAmt, due: Math.max(s.monthlyFee - paidAmt, 0) };
  });
}

// GET /api/payments?month=2026-10&student=<id>
router.get(
  "/",
  wrap(async (req, res) => {
    const filter = { owner: req.userId };
    if (req.query.month) filter.month = req.query.month;
    if (req.query.student) filter.student = req.query.student;
    const list = await Payment.find(filter).populate("student", "name batch").sort({ paidOn: -1 }).lean();
    res.json(list.map(p => ({ ...p, receiptNo: receiptNo(p) })));
  })
);

// GET /api/payments/status?month=2026-10  -> fee, paid, due per student
router.get(
  "/status",
  wrap(async (req, res) => {
    res.json(await feeStatus(req.userId, req.query.month || currentMonth()));
  })
);

// GET /api/payments/:id  -> one payment with student + centre details (for the receipt)
router.get(
  "/:id",
  wrap(async (req, res) => {
    const payment = await Payment.findOne({ _id: req.params.id, owner: req.userId })
      .populate("student", "name batch phone parentPhone monthlyFee")
      .lean();
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    const centre = await User.findById(req.userId, "centreName email").lean();
    res.json({ ...payment, receiptNo: receiptNo(payment), centre });
  })
);

router.post(
  "/",
  wrap(async (req, res) => {
    const { student, amount, month, mode, paidOn, note } = req.body;
    const exists = await Student.exists({ _id: student, owner: req.userId });
    if (!exists) return res.status(404).json({ error: "Student not found" });
    const payment = await Payment.create({
      owner: req.userId, student, amount, month: month || currentMonth(), mode, paidOn, note,
    });
    res.status(201).json({ ...payment.toObject(), receiptNo: receiptNo(payment) });
  })
);

router.delete(
  "/:id",
  wrap(async (req, res) => {
    const r = await Payment.deleteOne({ _id: req.params.id, owner: req.userId });
    if (!r.deletedCount) return res.status(404).json({ error: "Payment not found" });
    res.json({ ok: true });
  })
);

export default router;
