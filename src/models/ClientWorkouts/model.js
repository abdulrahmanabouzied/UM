import mongoose from "mongoose";
import validator from "validator";
import { parseTime } from "../../utils/time.service.js";

const daySchema = new mongoose.Schema({
  order: {
    type: Number,
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
  startsAt: {
    type: Date,
    // validate: [validator.isDate, "{VALUE} is not a valid date"],
  },
  startedAt: {
    type: Date,
    // validate: [validator.isDate, "{VALUE} is not a valid date"],
  },
  endsAt: {
    type: Date,
    // validate: [validator.isDate, "{VALUE} is not a valid date"],
  }, // date of the day corresponging order
  state: {
    type: String,
    enum: ["available", "inProgress", "done", "locked"],
    default: "locked",
  },
});

// when the client clicks on the day
daySchema.methods.startDay = function () {
  this.state = "inProgress";
  this.startedAt = new Date();
  this.endsAt = new Date(this.startedAt.getTime() + parseTime("1d", "ms"));

  console.log(this);
};

const clientWorkoutSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clients",
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutPlans",
      required: true,
    },
    days: [daySchema],
    assignedAt: {
      type: Date,
      validate: [validator.isDate, "{VALUE} is not a valid date"],
      required: true,
      // default: Date.now,
    },
    endingAt: {
      type: Date,
      required: false,
      validate: [validator.isDate, "{VALUE} is not a valid date"],
    },
    /*
    startedAt: {
      type: Date,
      // required: true,
      // validate: [validator.isDate, "{VALUE} is not a valid date"]
    },*/
    state: {
      type: String,
      enum: ["pendingStart", "done", "inProgress"],
      default: "pendingStart",
    },
  },
  { timestamps: true }
);

// setting the dates of days and the starting date
clientWorkoutSchema.pre("save", function (next) {
  // TODO: enhance the logic
  const currDate = new Date();

  if (!this.isModified("assignedAt") && !this.isModified("days")) return next();

  let dayCount = this.days.length;
  this.assignedAt = new Date(this.assignedAt);
  this.endingAt = new Date(
    this.assignedAt.getTime() + parseTime(`${dayCount}d`, "ms")
  );

  if (this.assignedAt >= currDate) {
    this.state = "pendingStart";
  }
  if (this.assignedAt <= currDate) {
    this.state = "inProgress";
  } else if (this.endingAt <= currDate) {
    this.state = "done";
  }

  this.days.forEach((day) => {
    day.startsAt = new Date(
      this.assignedAt.getTime() + parseTime(`${day.order - 1}d`, "ms")
    );
  }, this);

  next();
});

// to calculate the prpoper corresponding date to each field
clientWorkoutSchema.methods.clacDates = function () {
  let dayCount = this.days.length;
  this.assignedAt = new Date(this.assignedAt);
  this.endingAt = new Date(
    this.assignedAt.getTime() + parseTime(`${dayCount}d`, "ms")
  );

  if (this.assignedAt >= currDate) {
    this.state = "pendingStart";
  } else if (this.assignedAt <= currDate) {
    this.state = "inProgress";
  } else if (this.endingAt <= currDate) {
    this.state = "done";
  }

  this.days.forEach((day) => {
    day.startsAt = new Date(
      this.assignedAt.getTime() + parseTime(`${day.order - 1}d`, "ms")
    );
  }, this);
};

// method to check if a day must be available
clientWorkoutSchema.methods.checkDays = function () {
  // let dayCount = this.days.length;
  const currDate = Date.now();

  this.days = this.days.map((day) => {
    if (currDate >= day.startsAt && day.state == "locked") {
      day.state = "available";
    } else if (currDate >= day?.endsAt && day.state == "inProgress") {
      day.state = "done";
    }

    return day;
  });
};

// check if the start date is passed
clientWorkoutSchema.methods.checkState = function () {
  const currDate = new Date();

  if (currDate >= this.assignedAt) {
    this.state = "inProgress";
  }

  if (currDate >= this.endingAt) {
    this.state = "done";
  }

  return this.state;
};

// adding day

clientWorkoutSchema.methods.addDay = function (day) {
  if (!day.order) {
    day.order = this.days.length + 1;
  }

  this.days.push(day);
};

// clientWorkoutSchema.methods.startDay = function (day) {};

const ClientWorkout = mongoose.model("ClientWorkouts", clientWorkoutSchema);

export default ClientWorkout;
