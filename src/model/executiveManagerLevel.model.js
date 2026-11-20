
import mongoose from "mongoose";

const executiveManagerLevelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        customerCount: {
            type: Number,
            required: true,
            min: 0,
        },

        priceString: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ExecutiveManagerLevel = mongoose.model(
    "ExecutiveManagerLevel",
    executiveManagerLevelSchema
);

export default ExecutiveManagerLevel;
