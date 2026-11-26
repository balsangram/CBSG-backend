import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import adminOnly from "../../../middlewares/admin.middleware.js";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import {
  rejectAllSchema,
  rejectSectionSchema,
} from "../kyc/admin-kyc.validation.js";
import {
  approveAllSections,
  approveSection,
  getAllKycs,
  getKycByCustomer,
  rejectAll,
  rejectSection,
} from "../kyc/admin-kyc.controller.js";

const router = express.Router();

router.use(authMiddleware, adminOnly);

const SECTIONS_DOC =
  "personalDetails, address, aadhar, pan, photo, bankAccount, nominee";

/**
 * @swagger
 * /admin/kyc:
 *   get:
 *     summary: List customer KYCs with pagination, search, sort and filters
 *     description: Returns a page of KYC records plus meta counts per status (pending, approved, rejected) and pagination info.
 *     tags: [Admin KYC]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, VERIFIED, REJECTED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Matches customer name, email or phone
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, status, verifiedAt]
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]  
 *           default: desc
 *     responses:
 *       200:
 *         description: Paginated KYC list with status meta counts
 */
router.get("/", getAllKycs);

/**
 * @swagger
 * /admin/kyc/{customerId}:
 *   get:
 *     summary: Get a customer's KYC with all section statuses
 *     tags: [Admin KYC]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KYC details
 *       404:
 *         description: KYC not found
 */
router.get("/:customerId", getKycByCustomer);

/**
 * @swagger
 * /admin/kyc/{customerId}/sections/{section}/approve:
 *   patch:
 *     summary: Approve one KYC section
 *     description: Marks a single section VERIFIED and recalculates the overall KYC status.
 *     tags: [Admin KYC]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: section
 *         required: true
 *         schema:
 *           type: string
 *           enum: [personalDetails, address, aadhar, pan, photo, bankAccount, nominee]
 *     responses:
 *       200:
 *         description: Section approved
 */
router.patch("/:customerId/sections/:section/approve", approveSection);

/**
 * @swagger
 * /admin/kyc/{customerId}/approve-all:
 *   post:
 *     summary: Approve all reviewable KYC sections at once
 *     description: Marks every non-final section VERIFIED in a single action and notifies the customer once. REJECTED sections are left untouched.
 *     tags: [Admin KYC]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sections approved
 */
router.post("/:customerId/approve-all", approveAllSections);

/**
 * @swagger
 * /admin/kyc/{customerId}/sections/{section}/reject:
 *   patch:
 *     summary: Reject one KYC section
 *     description: Marks a single section REJECTED with an optional reason and per-field rejection flags.
 *     tags: [Admin KYC]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: section
 *         required: true
 *         schema:
 *           type: string
 *           enum: [personalDetails, address, aadhar, pan, photo, bankAccount, nominee]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *               rejectedFields:
 *                 type: object
 *                 additionalProperties:
 *                   type: boolean
 *     responses:
 *       200:
 *         description: Section rejected
 */
router.patch(
  "/:customerId/sections/:section/reject",
  validateMiddleware(rejectSectionSchema),
  rejectSection
);

/**
 * @swagger
 * /admin/kyc/{customerId}/reject:
 *   post:
 *     summary: Reject the entire KYC
 *     description: Marks the whole KYC REJECTED with an overall reason. Every section is set to REJECTED.
 *     tags: [Admin KYC]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC rejected
 */
router.post(
  "/:customerId/reject",
  validateMiddleware(rejectAllSchema),
  rejectAll
);

export default router;
