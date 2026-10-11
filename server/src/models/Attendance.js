import mongoose from "mongoose";

// One document per batch per day
const attendanceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // YYYY-MM-DD
    batch: { type: String, required: true },
    records: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        present: { type: Boolean, default: false },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

attendanceSchema.index({ owner: 1, date: 1, batch: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
