
import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
    {
        // Agent Name
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },

        // Email
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },


        photo: {
            type: String,
            default: null,
            trim: true,
        },

        // Phone Number
        phoneNo: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            trim: true,
        },


        // Agent Role
        role: {
            type: String,
            enum: ["executive_manager", "team_lead"],
            default: "team_lead",
            required: true,
        },

        // Assigned Level
        levelId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "levelModel",
            default: null,
        },

        // Dynamic Level Model
        levelModel: {
            type: String,
            enum: ["ExecutiveManagerLevel", "TeamLeadLevel"],
            default: null,
        },

        // Refresh Token
        refreshToken: {
            type: String,
            default: null,
            select: false,
        },

        // Firebase Cloud Messaging Token
        fcmToken: {
            type: String,
            default: null,
            trim: true,
        },

        // Account Status
        status: {
            type: String,
            enum: ["active", "inactive", "blocked"],
            default: "active",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Set Level Model Based on Agent Role
agentSchema.pre("validate", function () {
    if (this.role === "executive_manager") {
        this.levelModel = "ExecutiveManagerLevel";
    } else if (this.role === "team_lead") {
        this.levelModel = "TeamLeadLevel";
    }

    if (this.levelId && !this.levelModel) {
        this.invalidate("levelId", "Invalid level model");
    }
});

// Agent Model
const Agent = mongoose.model("Agent", agentSchema);

export default Agent;
