import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    parentPhone: { type: String, trim: true },
    batch: { type: String, required: true, trim: true },
    monthlyFee: { type: Number, required: true, min: 0 },
    joinDate: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
