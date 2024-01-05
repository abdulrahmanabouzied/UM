import mongoose from "mongoose";

/*
const daySchema = new mongoose.Schema({
  exercises: [
    {
      exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exercises",
      },
    },
  ],
});
*/

const workoutPlanSchema = new mongoose.Schema(
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
    image: {
      type: Object,
      // required: true,
    },
    description: String,
    isFavorite: { type: Boolean, default: false },
    days: [
      {
        order: {
          type: Number,
          unique: false,
          required: true,
        },
        exercises: [
          {
            exercise: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Exercises",
            },
          },
        ],
      },
    ],
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clients",
      },
    ],
  },
  { timestamps: true }
);

workoutPlanSchema.methods.addDay = function (dayData) {
  if (!dayData.order) {
    dayData.order = this.days.length + 1;
  }

  this.days.push(dayData);
};

const WorkoutPlan = mongoose.model("WorkoutPlans", workoutPlanSchema);

export default WorkoutPlan;
