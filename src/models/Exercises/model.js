import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    coach: {
      type: mongoose.Schema.ObjectId,
      ref: "Coaches",
      required: [true, "Coach Id required"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    image: {
      type: Object,
      required: false,
    },
    video: {
      type: String,
      required: true,
    },
    notes: String,
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Exercise = mongoose.model("Exercises", exerciseSchema);

export default Exercise;
