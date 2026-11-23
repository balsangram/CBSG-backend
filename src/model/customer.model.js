
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

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            trim: true,
        },

        joiningDate: {
            type: Date,
            default: Date.now,
        },

        // additional information ============================================

        fathersName: {
            type: String,
            trim: true,
            default: null,
        },
        dob: {
            type: Date,
            default: null,
        },
        address: {
            type: String,
            trim: true,
            default: null,
        },

        pinCode: {
            type: String,
            trim: true,
            default: null,
        },
        aadhar: {
            type: String,
            trim: true,
            default: null,
        },
        aadharDocument: {
            type: String,
            trim: true,
            default: null,
        },
        pan: {
            type: String,
            trim: true,
            default: null,
        },
        panDocument: {
            type: String,
            trim: true,
            default: null,
        },
        bankName: {
            type: String,
            trim: true,
            default: null,
        },
        accountNumber: {
            type: String,
            trim: true,
            default: null,
        },
        ifscCode: {
            type: String,
            trim: true,
            default: null,
        },
        monthlySaving: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalSaving: {
            type: Number,
            default: 0,
            min: 0,
        },
        isFistTime: {
            type: Boolean,
            default: false,
        },
        
        refreshToken: {
            type: [{ type: String, trim: true }],
            default: [],
            select: false,
        },

        fcmToken: {
            type: [{ type: String, trim: true }],
            default: [],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
