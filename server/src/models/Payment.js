import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true, min: 1 },
    // fee month this payment is for, format YYYY-MM
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    mode: { type: String, enum: ["cash", "upi", "bank", "other"], default: "cash" },
    paidOn: { type: Date, default: Date.now },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

paymentSchema.index({ owner: 1, month: 1 });

export default mongoose.model("Payment", paymentSchema);
