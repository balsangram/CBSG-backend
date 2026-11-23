import mongoose from "mongoose";

const SECTION_STATUS = [
  "PENDING",
  "IN_PROGRESS",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
];

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

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const KYC = mongoose.model("KYC", kycSchema);

export default KYC;
