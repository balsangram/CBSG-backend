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
 *     description: Creates a pending KYC record the first time it is requested. Each section has its own status, rejection reason, and rejected fields.
 *     tags: [Customer KYC]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: KYC status fetched successfully
 *                 data:
 *                   id: 6741a0c2e1b2c3d4e5f60730
 *                   userId: 6741a0c2e1b2c3d4e5f60710
 *                   personalDetails:
 *                     status: PENDING
 *                     rejectionReason: null
 *                     rejectedFields:
 *                       name: false
 *                       phone: false
 *                       fathersName: false
 *                       dob: false
 *                   address:
 *                     status: PENDING
 *                     rejectionReason: null
 *                     rejectedFields:
 *                       address: false
 *                       pinCode: false
 *                   aadhar:
 *                     status: PENDING
 *                     rejectionReason: null
 *                     rejectedFields:
 *                       aadhar: false
 *                       aadharDocument: false
 *                   pan:
 *                     status: PENDING
 *                     rejectionReason: null
 *                     rejectedFields:
 *                       pan: false
 *                       panDocument: false
 *                   photo:
 *                     status: PENDING
 *                     rejectionReason: null
 *                   bankAccount:
 *                     status: PENDING
 *                     rejectionReason: null
 *                     rejectedFields:
 *                       bankName: false
 *                       accountNumber: false
 *                       ifscCode: false
 *                   nominee:
 *                     status: PENDING
 *                     rejectionReason: null
 *                     rejectedFields:
 *                       nomineeName: false
 *                       nomineeRelation: false
 *                   status: PENDING
 *                   verifiedAt: null
 */
router.get("/status", kycStatus);

/**
 * @swagger
 * /customer/kyc/{id}:
 *   patch:
 *     summary: Update KYC sections for the logged-in customer
 *     description: Send one or more sections. Each section can include status, rejectionReason, and rejectedFields. Photo has no rejectedFields.
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
 *                 type: object
 *               address:
 *                 type: object
 *               aadhar:
 *                 type: object
 *               pan:
 *                 type: object
 *               photo:
 *                 type: object
 *               bankAccount:
 *                 type: object
 *               nominee:
 *                 type: object
 *             example:
 *               personalDetails:
 *                 status: REJECTED
 *                 rejectionReason: Name does not match the document
 *                 rejectedFields:
 *                   name: true
 *                   phone: false
 *                   fathersName: false
 *                   dob: false
 *     responses:
 *       200:
 *         description: KYC updated
 */
router.patch("/:id", validateMiddleware(updateKycSchema), updateKyc);

export default router;
