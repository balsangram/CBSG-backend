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
 *     summary: Get the logged-in customer's bank details
 *     tags: [Customer Bank]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Bank name, account number, and IFSC code
 *   post:
 *     summary: Save bank details
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
 *         description: Bank details saved
 *       409:
 *         description: Bank details already exist
 */
router.get("/", getBankDetails);
router.post("/", validateMiddleware(saveBankSchema), saveBankDetails);

/**
 * @swagger
 * /customer/bank/{id}:
 *   patch:
 *     summary: Update the logged-in customer's bank details
 *     tags: [Customer Bank]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer id returned by the bank details response
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
 *   delete:
 *     summary: Clear the logged-in customer's bank details
 *     tags: [Customer Bank]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bank details cleared
 */
router.patch("/:id", validateMiddleware(updateBankSchema), updateBankDetails);
router.delete("/:id", deleteBankDetails);

export default router;
