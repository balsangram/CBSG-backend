
import app from "./app.js";
import env from "./config/env.js";
import connectDB from "./config/db.js";
import runSeeders from "./seeders/index.js";

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Run seeders only in development
    if (env.NODE_ENV === "dev") {
      await runSeeders();
    }

    // Render injects PORT and reaches the process on 0.0.0.0.
    const port = Number(process.env.PORT) || env.PORT;
    const server = app.listen(port, "0.0.0.0", () => {
      console.log("-----------------------------------");
      console.log(`${env.APP_NAME} Server Started`);
      console.log(`Environment : ${env.NODE_ENV}`);
      console.log(`Port        : ${port}`);
      console.log(`API URL     : http://localhost:${port}/api/v1`);
      console.log(`Swagger     : http://localhost:${port}/api-docs`);
      console.log("-----------------------------------");
    });

    // 4. Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        const mongoose = await import("mongoose");
        await mongoose.default.connection.close();

        console.log("MongoDB disconnected");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
