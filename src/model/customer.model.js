
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Customer name is required"],
            trim: true,
        },

        email: {
            type: String,
            lowercase: true,
            trim: true,
            default: null,
        },

        photo: {
            type: String,
            default: null,
            trim: true,
        },

        phoneNo: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            trim: true,
        },

        joiningDate: {
            type: Date,
            default: Date.now,
        },

        refreshToken: {
            type: String,
            default: null,
            select: false,
        },

        fcmToken: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
