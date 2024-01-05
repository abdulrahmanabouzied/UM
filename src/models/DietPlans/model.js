import mongoose from "mongoose";
import AppError from "../../utils/AppError.js";

const daySchema = new mongoose.Schema({
  order: {
    type: Number,
    unique: false,
    required: true,
  },
  breakfast: {
    time: Date,
    ingredients: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredients",
        },
      },
    ],
  },
  midMorning: {
    time: Date,
    ingredients: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredients",
        },
      },
    ],
  },
  lunch: {
    time: Date,
    ingredients: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredients",
        },
      },
    ],
  },
  eveningSnacks: {
    time: Date,
    ingredients: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredients",
        },
      },
    ],
  },
  dinner: {
    time: Date,
    ingredients: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredients",
        },
      },
    ],
  },
});

daySchema.pre("save", function (next) {
  try {
    this.breakfast.time = new Date(this.breakfast.time);
    this.midMorning.time = new Date(this.midMorning.time);
    this.lunch.time = new Date(this.lunch.time);
    this.eveningSnacks.time = new Date(this.eveningSnacks.time);
    this.dinner.time = new Date(this.dinner.time);
    next();
  } catch (error) {
    console.log(error.stack);
    next();
  }
});

const dietPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    coach: {
      type: mongoose.Schema.ObjectId,
      ref: "Coaches",
      required: [true, "Coach Id required"],
    },
    totalCalories: Number,
    days: [daySchema],
    description: String,
    isFavorite: { type: Boolean, default: false },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clients",
      },
    ],
  },
  { timestamps: true }
);

dietPlanSchema.methods.addDay = function (dayData) {
  if (!dayData.order) {
    dayData.order = this.days.length + 1;
  }

  this.days.push(dayData);
};

const DietPlan = mongoose.model("DietPlans", dietPlanSchema);

export default DietPlan;
