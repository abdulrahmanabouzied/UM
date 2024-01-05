import mongoose from "mongoose";
import validator from "validator";

const clientAuditSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clients",
      required: true,
    },
    weight: [
      {
        date: {
          type: Date,
          validate: [validator.isDate, "{VALUE} not a valid date"],
          default: Date.now,
        },
        value: { type: Number, required: true },
      },
    ],
    subscriptions: [
      {
        date: {
          type: Date,
          validate: [validator.isDate, "{VALUE} not a valid date"],
          default: Date.now,
        },
        value: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subscriptions",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const ClientAudit = mongoose.model("ClientAudits", clientAuditSchema);

export default ClientAudit;
