import swaggerJsdoc from "swagger-jsdoc";
import env from "./env.js";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "CBSG API",
      version: "1.0.0",
      description: "CBSG backend API documentation",
    },

    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: "Local development server",
      },
    ],

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
  },

  apis: ["./src/modules/**/*.routes.js", "./src/app.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;