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
    supplements: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplements",
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
    supplements: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplements",
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
    supplements: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplements",
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
    supplements: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplements",
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
    supplements: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplements",
        },
        done: { type: Boolean, default: false },
      },
    ],
  },
});

const clientSupplementSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clients",
      required: true,
    },
    // name: String,
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupplementPlans",
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

clientSupplementSchema.pre("save", function (next) {
  const currDate = new Date(Date.now());

  if (
    !this.isModified("assignedAt") &&
    !this.isModified("endingAt") &&
    !this.isModified("days")
  )
    return next();

  if (this.assignedAt > currDate) {
    this.state = "pendingStart";
  } else if (this.assignedAt <= currDate) {
    this.state = "inProgress";
  }
  if (this.endingAt <= currDate) {
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
clientSupplementSchema.methods.clacDates = async function () {
  this.days.forEach((day) => {
    day.startsAt = new Date(
      this.assignedAt.getTime() + parseTime(`${day.order - 1}d`, "ms")
    );
  }, this);
};

clientSupplementSchema.methods.checkState = function () {
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

clientSupplementSchema.methods.addDay = function (day) {
  if (!day.order) {
    day.order = this.days.length + 1;
  }

  this.days.push(day);
};

// get day by date [mm, dd, yyyy]
clientSupplementSchema.methods.getDayByDate = function (date) {
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

const ClientSupplement = mongoose.model(
  "ClientSupplements",
  clientSupplementSchema
);

export default ClientSupplement;
