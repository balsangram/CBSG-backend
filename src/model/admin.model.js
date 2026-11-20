
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
    {
        // Admin Name
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

        // Password
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8,
            select: false,
        },

        // Role
        role: {
            type: String,
            enum: ["admin", "sub_admin"],
            default: "sub_admin",
            required: true,
        },

        // Refresh Token
        refreshToken: {
            type: String,
            default: null,
            select: false,
        },

        // Assigned Services
        services: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service",
            },
        ],

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

// Hash Password Before Saving
adminSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

// Compare Password
adminSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// Admin Model
const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
