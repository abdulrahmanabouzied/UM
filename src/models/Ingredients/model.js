import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
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
    servingSize: { type: Number, required: [true, "serving-size is required"] },
    calories: Number,
    carbs: Number,
    proteins: Number,
    fats: Number,
  },
  { timestamps: true }
);

const Ingredient = mongoose.model("Ingredients", ingredientSchema);

export default Ingredient;
