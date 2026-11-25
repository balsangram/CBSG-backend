import mongoose from "mongoose";

<<<<<<< HEAD
const SECTION_STATUS = [
  "PENDING",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
  "REUPLOAD"
];
=======
const SECTION_STATUS = ["PENDING", "VERIFIED", "REJECTED"];
>>>>>>> 787c151 (customer updated)

const sectionSchema = (rejectedFieldNames = []) => {
  const definition = {
    status: {
      type: String,
      enum: SECTION_STATUS,
      default: "PENDING",
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  };

  if (rejectedFieldNames.length) {
    const rejectedFields = {};

    for (const name of rejectedFieldNames) {
      rejectedFields[name] = {
        type: Boolean,
        default: false,
      };
    }

    definition.rejectedFields = rejectedFields;
  }

  return new mongoose.Schema(definition, { _id: false });
};

const section = (rejectedFieldNames) => ({
  type: sectionSchema(rejectedFieldNames),
  default: () => ({}),
});

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    personalDetails: section(["name", "phone", "fathersName", "dob"]),

    address: section(["address", "pinCode"]),

    aadhar: section(["aadhar", "aadharDocument"]),

    pan: section(["pan", "panDocument"]),

    photo: section(),

    bankAccount: section(["bankName", "accountNumber", "ifscCode"]),

    nominee: section(["nomineeName", "nomineeRelation"]),

    status: {
      type: String,
      enum: SECTION_STATUS,
      default: "PENDING",
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

kycSchema.index({ status: 1, createdAt: -1 });
kycSchema.index({ verifiedBy: 1 });

const KYC = mongoose.model("KYC", kycSchema);

export default KYC;
