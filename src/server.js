
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

    // 3. Start Express server
    const server = app.listen(env.PORT, () => {
      console.log("-----------------------------------");
      console.log(`${env.APP_NAME} Server Started`);
      console.log(`Environment : ${env.NODE_ENV}`);
      console.log(`Port        : ${env.PORT}`);
      console.log(`API URL     : http://localhost:${env.PORT}/api/v1`);
      console.log(`Swagger     : http://localhost:${env.PORT}/api-docs`);
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
