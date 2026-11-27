import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        seq: {
            type: Number,
            default: 0,
        },
    },
    {
        versionKey: false,
    }
);

const Counter = mongoose.model("Counter", counterSchema);

const nextSequence = async (key) => {
    const counter = await Counter.findOneAndUpdate(
        { key },
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    return counter.seq;
};

const formatSequenceId = (prefix, seq, width = 4) => {
    return `${prefix}${String(seq).padStart(width, "0")}`;
};

export { nextSequence, formatSequenceId };
export default Counter;
