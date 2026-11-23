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
        CustomerTransaction: {
          type: "object",
          properties: {
            id: { type: "string", example: "6740c2a1b8e4f1a2c3d4e5f6" },
            transactionId: { type: "string", example: "TXN123456" },
            type: { type: "string", enum: ["SAVING", "WITHDRAWAL"], example: "SAVING" },
            amount: { type: "number", example: 2000 },
            currency: { type: "string", example: "INR" },
            status: {
              type: "string",
              enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REVERSED"],
              example: "COMPLETED",
            },
            paymentType: {
              type: "string",
              enum: ["UPI", "BANK", "CARD", "NETBANKING"],
              example: "UPI",
            },
            failureReason: { type: "string", nullable: true, example: null },
            completedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: "2026-11-01T04:30:00.000Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-11-01T04:30:00.000Z",
            },
          },
        },
        DashboardResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Dashboard fetched successfully" },
            data: {
              type: "object",
              properties: {
                monthlySaving: { type: "number", example: 2000 },
                totalSaving: { type: "number", example: 15000 },
                transactions: {
                  type: "array",
                  maxItems: 5,
                  items: { $ref: "#/components/schemas/CustomerTransaction" },
                },
              },
            },
          },
          example: {
            success: true,
            message: "Dashboard fetched successfully",
            data: {
              monthlySaving: 2000,
              totalSaving: 15000,
              transactions: [
                {
                  id: "6740c2a1b8e4f1a2c3d4e5f6",
                  transactionId: "TXN123456",
                  type: "SAVING",
                  amount: 2000,
                  currency: "INR",
                  status: "COMPLETED",
                  paymentType: "UPI",
                  failureReason: null,
                  completedAt: "2026-11-01T04:30:00.000Z",
                  createdAt: "2026-11-01T04:30:00.000Z",
                },
              ],
            },
          },
        },
        CustomerProfileResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Profile fetched successfully" },
            data: {
              type: "object",
              properties: {
                id: { type: "string", example: "6740c2a1b8e4f1a2c3d4e5f6" },
                name: { type: "string", example: "Asha Patel" },
                email: { type: "string", nullable: true, example: "asha@example.com" },
                photo: { type: "string", nullable: true, example: null },
                phone: { type: "string", example: "9876543210" },
                joiningDate: { type: "string", format: "date-time" },
                fathersName: { type: "string", nullable: true, example: "Ramesh Patel" },
                dob: { type: "string", format: "date", nullable: true, example: "1995-04-12" },
                address: { type: "string", nullable: true, example: "12 Market Road" },
                pinCode: { type: "string", nullable: true, example: "380001" },
                aadhar: { type: "string", nullable: true, example: "234567890123" },
                aadharDocument: { type: "string", nullable: true, example: null },
                pan: { type: "string", nullable: true, example: "ABCDE1234F" },
                panDocument: { type: "string", nullable: true, example: null },
                bankName: { type: "string", nullable: true, example: "State Bank of India" },
                accountNumber: { type: "string", nullable: true, example: "123456789012" },
                ifscCode: { type: "string", nullable: true, example: "SBIN0001234" },
                filledFields: { type: "integer", example: 10 },
                totalFields: { type: "integer", example: 16 },
              },
            },
          },
        },
        TransactionListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Transactions fetched successfully" },
            data: {
              type: "object",
              properties: {
                summary: {
                  type: "object",
                  properties: {
                    totalSaved: { type: "number", example: 15000 },
                    totalWithdrawn: { type: "number", example: 3000 },
                    totalInterest: { type: "number", example: 450 },
                  },
                },
                transactions: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CustomerTransaction" },
                },
                pagination: {
                  type: "object",
                  properties: {
                    page: { type: "integer", example: 1 },
                    limit: { type: "integer", example: 10 },
                    total: { type: "integer", example: 24 },
                    totalPages: { type: "integer", example: 3 },
                  },
                },
              },
            },
          },
          example: {
            success: true,
            message: "Transactions fetched successfully",
            data: {
              summary: {
                totalSaved: 15000,
                totalWithdrawn: 3000,
                totalInterest: 450,
              },
              transactions: [
                {
                  id: "6740c2a1b8e4f1a2c3d4e5f6",
                  transactionId: "TXN123456",
                  type: "SAVING",
                  amount: 2000,
                  currency: "INR",
                  status: "COMPLETED",
                  paymentType: "UPI",
                  failureReason: null,
                  completedAt: "2026-11-01T04:30:00.000Z",
                  createdAt: "2026-11-01T04:30:00.000Z",
                },
              ],
              pagination: {
                page: 1,
                limit: 10,
                total: 24,
                totalPages: 3,
              },
            },
          },
        },
      },
    },
  },

  apis: ["./src/modules/**/*.routes.js", "./src/app.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;