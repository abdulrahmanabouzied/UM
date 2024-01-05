import mongoose from "mongoose";

const daySchema = new mongoose.Schema({
  order: {
    type: Number,
    unique: false,
    required: true,
  },
  breakfast: {
    time: Date,
    supplements: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplements",
        },
      },
    ],
  },
  midMorning: {
    time: Date,
    supplements: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplements",
        },
      },
    ],
  },
  lunch: {
    time: Date,
    supplements: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplements",
        },
      },
    ],
  },
  eveningSnacks: {
    time: Date,
    supplements: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplements",
        },
      },
    ],
  },
  dinner: {
    time: Date,
    supplements: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplements",
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

const supplementPlanSchema = new mongoose.Schema(
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

supplementPlanSchema.methods.addDay = function (dayData) {
  if (!dayData.order) {
    dayData.order = this.days.length + 1;
  }

  this.days.push(dayData);
};

const SupplementPlan = mongoose.model("SupplementPlans", supplementPlanSchema);

export default SupplementPlan;
