import mongoose from "mongoose";
import validator from "validator";
import { parseTime } from "../../utils/time.service.js";

const daySchema = new mongoose.Schema({
  state: {
    type: String,
    enum: ["available", "inProgress", "done", "locked"],
  },
  startsAt: {
    type: Date,
    // validate: [validator.isDate, "{VALUE} is not a valid date"],
  },
  /*
  endsAt: {
    type: Date,
    // validate: [validator.isDate, "{VALUE} is not a valid date"],
  },*/
  order: {
    type: Number,
    required: true,
  },
  breakfast: {
    time: {
      type: Date,
      validate: [validator.isDate, "{VALUE} is not a valid date"],
    },
    ingredients: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredients",
        },
        done: { type: Boolean, default: false },
      },
    ],
  },
  midMorning: {
    time: {
      type: Date,
      validate: [validator.isDate, "{VALUE} is not a valid date"],
    },
    ingredients: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredients",
        },
        done: { type: Boolean, default: false },
      },
    ],
  },
  lunch: {
    time: {
      type: Date,
      validate: [validator.isDate, "{VALUE} is not a valid date"],
    },
    ingredients: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredients",
        },
        done: { type: Boolean, default: false },
      },
    ],
  },
  eveningSnacks: {
    time: {
      type: Date,
      validate: [validator.isDate, "{VALUE} is not a valid date"],
    },
    ingredients: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredients",
        },
        done: { type: Boolean, default: false },
      },
    ],
  },
  dinner: {
    time: {
      type: Date,
      validate: [validator.isDate, "{VALUE} is not a valid date"],
    },
    ingredients: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredients",
        },
        done: { type: Boolean, default: false },
      },
    ],
  },
});

const clientDietSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clients",
      required: true,
    },
    // name: String,
    // totalCalories: Number,
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DietPlans",
      required: true,
    },
    days: [daySchema],
    assignedAt: {
      type: Date,
      // validate: [validator.isDate, "{VALUE} is not a valid date"],
    },
    endingAt: {
      type: Date,
      // validate: [validator.isDate, "{VALUE} is not a valid date"],
    },
    state: {
      type: String,
      enum: ["pendingStart", "done", "inProgress"],
      default: "pendingStart",
    },
  },
  { timestamps: true }
);

clientDietSchema.pre("save", function (next) {
  const currDate = new Date(Date.now());

  if (!this.isModified("assignedAt") && !this.isModified("days")) return next();

  let dayCount = this.days.length;
  console.log(`plan assignment: ${this.assignedAt}`);
  this.assignedAt = new Date(this.assignedAt);
  this.endingAt = new Date(
    this.assignedAt.getTime() + parseTime(`${dayCount}d`, "ms")
  );
  if (this.assignedAt > currDate) {
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

  next();
});

// the corresponding date for each day in the array
clientDietSchema.methods.clacDates = function () {
  const currDate = new Date();

  if (this.assignedAt > currDate) {
    this.state = "pendingStart";
  } else if (this.assignedAt <= currDate) {
    this.state = "inProgress";
  }
  if (currDate >= this.endingAt) {
    this.state = "done";
  }

  this.days.forEach((day) => {
    day.startsAt = new Date(
      this.assignedAt.getTime() + parseTime(`${day.order - 1}d`, "ms")
    );
  }, this);
};

clientDietSchema.methods.checkState = function () {
  const currDate = new Date();

  if (this.assignedAt > currDate) {
    this.state = "pendingStart";
  } else if (this.assignedAt <= currDate) {
    this.state = "inProgress";
  }
  if (currDate >= this.endingAt) {
    this.state = "done";
  }

  return this.state;
};

clientDietSchema.methods.addDay = function (day) {
  if (!day.order) {
    day.order = this.days.length + 1;
  }

  this.days.push(day);
};

// get day by date [mm, dd, yyyy]
clientDietSchema.methods.getDayByDate = function (date) {
  date = new Date(date || Date.now());

  const day = this.days.find((day) => {
    return (
      day.startsAt.getDate() === date.getDate() &&
      day.startsAt.getMonth() === date.getMonth() &&
      day.startsAt.getFullYear() === date.getFullYear()
    );
  });

  return day;
};

const ClientDiet = mongoose.model("ClientDiets", clientDietSchema);

export default ClientDiet;
