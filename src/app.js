
import express from "express";
import swaggerUi from "swagger-ui-express";

import corsConfig from "./config/cors.js";
import swaggerSpec from "./config/swagger.js";
import routes from "./routes/index.routes.js";

import rateLimitMiddleware from "./middlewares/rateLimit.middleware.js";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(corsConfig);

// Rate limiter
app.use(rateLimitMiddleware);

const health = (req, res) => {
  res.status(200).json({
    success: true,
    message: "CBSG API is running",
    timestamp: new Date().toISOString(),
  });
};

app.get("/", health);
app.get("/health", health);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 */
app.get("/api/v1/health", health);

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// API routes
app.use("/api/v1", routes);

// 404 handler
app.use(notFoundMiddleware);

// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
