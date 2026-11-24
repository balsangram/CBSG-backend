import mongoose from "mongoose";

const incentiveSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: [true, "Agent is required"],
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer is required"],
      index: true,
    },

    amount: {
      type: Number,
      required: [true, "Incentive amount is required"],
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

incentiveSchema.index({ agentId: 1, customerId: 1 });

const Incentive = mongoose.model("Incentive", incentiveSchema);

export default Incentive;
