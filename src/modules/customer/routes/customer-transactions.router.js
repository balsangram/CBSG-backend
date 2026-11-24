import express from "express";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import { sendAmountSchema } from "../pay/customer-pay.validation.js";
import {
  sendAmountToAdmin,
  transactions,
  withdrawAmount,
} from "../transaction/customer-transaction.controller.js";

const router = express.Router();

/**
 * @swagger
 * /customer/transactions/saving:
 *   post:
 *     summary: Send a saving to admin
 *     description: Creates a pending SAVING transaction. Amount is required. Type is not sent.
 *     tags: [Customer Pay]
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
 *                 example: 1000
 *               paymentType:
 *                 type: string
 *                 enum: [UPI, BANK, CARD, NETBANKING]
 *                 default: BANK
 *     responses:
 *       201:
 *         description: Saving created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication token is missing or expired
 *       404:
 *         description: Customer not found
 */
router.post("/saving", validateMiddleware(sendAmountSchema), sendAmountToAdmin);

/**
 * @swagger
 * /customer/transactions/withdrawal:
 *   post:
 *     summary: Withdraw an amount
 *     description: Creates a pending WITHDRAWAL transaction. Allowed only when the customer's KYC status is VERIFIED.
 *     tags: [Customer Pay]
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
 *                 example: 1000
 *               paymentType:
 *                 type: string
 *                 enum: [UPI, BANK, CARD, NETBANKING]
 *                 default: BANK
 *     responses:
 *       201:
 *         description: Withdrawal created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication token is missing or expired
 *       403:
 *         description: First verify your KYC
 *       404:
 *         description: Customer not found
 */
router.post("/withdrawal", validateMiddleware(sendAmountSchema), withdrawAmount);

/**
 * @swagger
 * /customer/transactions:
 *   get:
 *     summary: List the logged-in customer's transactions
 *     description: Returns every transaction with pagination, plus totals for pending, processing, and completed savings and withdrawals, and interest.
 *     tags: [Customer Pay]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Transaction page and savings summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionListResponse'
 *       401:
 *         description: Authentication token is missing or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", transactions);

export default router;
