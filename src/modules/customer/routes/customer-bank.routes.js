import express from "express";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import {
  saveBankSchema,
  updateBankSchema,
} from "../bank/customer-bank.validation.js";
import {
  deleteBankDetails,
  getBankDetails,
  saveBankDetails,
  updateBankDetails,
} from "../bank/customer-bank.contoller.js";

const router = express.Router();

/**
 * @swagger
 * /customer/bank:
 *   get:
 *     summary: Get the logged-in customer's bank account
 *     tags: [Customer Bank]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Bank name, account number, and IFSC code
 *   post:
 *     summary: Save the customer's bank account
 *     tags: [Customer Bank]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bankName, accountNumber, ifscCode]
 *             properties:
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               ifscCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bank account saved
 *       409:
 *         description: Bank details already exist
 */
router.get("/", getBankDetails);
router.post("/", validateMiddleware(saveBankSchema), saveBankDetails);

/**
 * @swagger
 * /customer/bank:
 *   patch:
 *     summary: Update the logged-in customer's bank account
 *     tags: [Customer Bank]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               ifscCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bank details updated
 *       404:
 *         description: Bank details not found
 *   delete:
 *     summary: Clear the logged-in customer's bank details
 *     tags: [Customer Bank]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Bank details cleared
 */
router.patch("/", validateMiddleware(updateBankSchema), updateBankDetails);
router.delete("/", deleteBankDetails);

export default router;
