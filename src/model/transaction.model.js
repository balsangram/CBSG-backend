
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    type: {
      type: String,
      enum: ["SAVING", "WITHDRAWAL"],
      default: "SAVING",
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "REVERSED",
      ],
      default: "COMPLETED",
    },

    paymentType: {
      type: String,
      enum: ["UPI", "BANK", "CARD", "NETBANKING"],
      default: "UPI",
    },

    // User's withdrawal destination
    beneficiary: {
      upiId: {
        type: String,
        default: null,
      },

      bankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BankAccount",
        default: null,
      },
    },

    failureReason: {
      type: String,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);

export default Transaction;
