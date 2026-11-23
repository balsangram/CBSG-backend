import express from "express";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import { updateKycSchema } from "../kyc/customer-kyc.validation.js";
import { kycStatus, updateKyc } from "../kyc/customer-kyc.controller.js";

const router = express.Router();

/**
 * @swagger
 * /customer/kyc/status:
 *   get:
 *     summary: Get the logged-in customer's KYC status
 *     description: Creates a pending KYC record the first time it is requested.
 *     tags: [Customer KYC]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status
 */
router.get("/status", kycStatus);

/**
 * @swagger
 * /customer/kyc/{id}:
 *   patch:
 *     summary: Update KYC section flags for the logged-in customer
 *     tags: [Customer KYC]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: KYC id returned by the status API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personalDetails:
 *                 type: boolean
 *               address:
 *                 type: boolean
 *               aadhaarPan:
 *                 type: boolean
 *               bankAccount:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: KYC updated
 */
router.patch("/:id", validateMiddleware(updateKycSchema), updateKyc);

export default router;
