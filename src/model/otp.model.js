
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "accountModel",
        },

        accountModel: {
            type: String,
            required: true,
            enum: ["Admin", "Agent", "Customer"],
        },

        otp: {
            type: String,
            required: true,
            select: false,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        attempts: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Automatically delete expired OTP records
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
