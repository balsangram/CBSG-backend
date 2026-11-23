
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      required: true,
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
      default: "PENDING",
    },

    paymentType: {
      type: String,
      enum: ["UPI", "BANK", "CARD", "NETBANKING"],
      required: true,
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

      razorpayFundAccountId: {
        type: String,
        default: null,
      },
    },

    // Razorpay transaction references
    razorpay: {
      orderId: {
        type: String,
        default: null,
      },

      paymentId: {
        type: String,
        default: null,
      },

      payoutId: {
        type: String,
        default: null,
      },

      utr: {
        type: String,
        default: null,
      },

      referenceId: {
        type: String,
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
