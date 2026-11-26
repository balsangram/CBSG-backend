
import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    // Scheme name
    schemeName: {
      type: String,
      required: true,
      trim: true,
    },

    // Plan category
    planType: {
      type: String,
      required: true,
      trim: true,
    },

    // Minimum investment amount
    minimumInvestmentAmount: {
      type: Number,
      required: true,
      min: 100,
    },

    // Interest payout frequency
    payout: {
      type: Number,
      required: true,
    },

    // Monthly interest percentage
    monthlyInterest: {
      type: Number,
      required: true,
      min: 0,
    },

    // Pre-closure rule text shown to customers
    preClosureRule: {
      type: String,
      trim: true,
      default: "",
    },

    // Monthly interest credit date
    monthlyInterestDate: {
      type: Date,
      default: null,
    },

    // Plan rules
    planRules: [
      {
        ruleName: {
          type: String,
          required: true,
          trim: true,
        },

        description: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
