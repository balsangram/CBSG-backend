
import mongoose from "mongoose";
import { formatSequenceId, nextSequence } from "./counter.model.js";

const AGENT_ID_PREFIX = {
    executive_manager: "EM",
    team_lead: "TL",
};

const agentSchema = new mongoose.Schema(
    {
        // Auto Generated Employee Id — EM0001 or TL0001 based on role
        employeeId: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },

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
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            trim: true,
        },


        // Agent Role
        role: {
            type: String,
            enum: ["executive_manager", "team_lead"],
            default: "executive_manager",
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

        // Assigned Branch
        branchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            default: null,
            index: true,
        },

        // Assigned Target
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Target",
            default: null,
        },

        // Refresh Token
        refreshToken: {
            type: [{ type: String, trim: true }],
            default: [],
            select: false,
        },

        // Firebase Cloud Messaging Token
        fcmToken: {
            type: [{ type: String, trim: true }],
            default: [],
        },

        // Account Status
        status: {
            type: String,
            enum: ["active", "inactive", "blocked"],
            default: "active",
        },

        totalCustomer: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalSaving: {
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

agentSchema.pre("save", async function () {
    if (this.employeeId) return;

    const prefix = AGENT_ID_PREFIX[this.role];
    if (!prefix) return;

    const seq = await nextSequence(`agent:${this.role}`);
    this.employeeId = formatSequenceId(prefix, seq);
});

const assignEmployeeId = async (agent) => {
    if (!agent || agent.employeeId) return agent?.employeeId || null;

    const prefix = AGENT_ID_PREFIX[agent.role];
    if (!prefix) return null;

    const seq = await nextSequence(`agent:${agent.role}`);
    const employeeId = formatSequenceId(prefix, seq);
    const updated = await Agent.findOneAndUpdate(
        {
            _id: agent._id,
            $or: [{ employeeId: null }, { employeeId: { $exists: false } }],
        },
        { $set: { employeeId } },
        { new: true }
    ).select("employeeId");

    if (updated?.employeeId) {
        agent.employeeId = updated.employeeId;
        return agent.employeeId;
    }

    const current = await Agent.findById(agent._id).select("employeeId");
    agent.employeeId = current?.employeeId || null;
    return agent.employeeId;
};

// Agent Model
const Agent = mongoose.model("Agent", agentSchema);

export { assignEmployeeId };
export default Agent;
