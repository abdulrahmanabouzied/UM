import mongoose from "mongoose";

const supplementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["tablet", "grams"],
      required: [true, "type-required"],
    },
    coach: {
      type: mongoose.Schema.ObjectId,
      ref: "Coaches",
      required: [true, "Coach Id required"],
    },
    dosage: { type: Number, required: [true, "dosage-required"] },
    notes: String,
  },
  { timestamps: true }
);

const Supplement = mongoose.model("Supplements", supplementSchema);

export default Supplement;
