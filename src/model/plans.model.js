
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
      min: 1,
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

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

planSchema.pre("validate", function () {
  this.isActive = this.status === "PUBLISHED";
});

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
