import express from "express";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import { createWithdrawalSchema } from "../withdrawal/agent-withdrawal.validation.js";
import {
  createWithdrawal,
  getWithdrawal,
} from "../withdrawal/agent-withdrawal.controller.js";

const router = express.Router();

/**
 * @swagger
 * /agent/manager/withdrawal:
 *   get:
 *     summary: List the logged-in agent's withdrawals
 *     description: Works for executive_manager and team_lead. Returns withdrawals newest first, including submitted date, time, and the bank details saved at request time.
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Withdrawal list
 *   post:
 *     summary: Request a withdrawal
 *     description: Saves amount, submitted date and time in IST, and copies bankName, accountNumber, and ifscCode from the agent. Bank details must already exist.
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Withdrawal requested
 *       400:
 *         description: Bank details missing or validation failed
 */
router.get("/", getWithdrawal);
router.post("/", validateMiddleware(createWithdrawalSchema), createWithdrawal);

export default router;
