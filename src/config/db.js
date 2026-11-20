
import mongoose from "mongoose";
import env from "./env.js";

const connectDB = async () => {
  try {
    if (!env.MONGO_URI) {
      throw new Error("MongoDB URI is missing in environment variables");
    }

    await mongoose.connect(env.MONGO_URI);

    console.log("=================================");
    console.log("MongoDB Connected Successfully");
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Environment: ${env.NODE_ENV}`);
    console.log("=================================");

  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected Successfully");
  } catch (error) {
    console.error("MongoDB Disconnection Failed:", error.message);
    throw error;
  }
};

export { connectDB, disconnectDB };
export default connectDB;
