import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    // Branch Name
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },

    // City
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
