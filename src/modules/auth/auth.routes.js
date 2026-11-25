import express from "express";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import {
    adminLoginSchema,
    adminVerifyOtpSchema,
    agentSendOtpSchema,
    agentVerifyOtpSchema,
    customerSendOtpSchema,
    customerVerifyOtpSchema,
} from "./auth.validation.js";
import {
    adminLogin,
    adminVerifyOtp,
    agentSendOtp,
    agentVerifyOtp,
    customerSendOtp,
    customerVerifyOtp,
} from "./auth.controller.js";

const router = express.Router();

/**
 * @swagger
 * /auth/customer/send-otp:
 *   post:
 *     summary: Send OTP to a customer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent. data.id is required for verify
 *       404:
 *         description: Customer not found
 */
router.post(
    "/customer/send-otp",
    validateMiddleware(customerSendOtpSchema),
    customerSendOtp
);
/**
 * @swagger
 * /auth/customer/verify-otp:
 *   post:
 *     summary: Verify customer OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, otp, id]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               id:
 *                 type: string
 *                 description: OTP record id returned by send OTP
 *               fcmToken:
 *                 type: string
 *                 description: Optional device token. Stored only if it is new. Maximum 3.
 *     responses:
 *       200:
 *         description: Customer logged in. status is the KYC status only.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Customer logged in successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                           nullable: true
 *                         role:
 *                           type: string
 *                           example: customer
 *                         photo:
 *                           type: string
 *                           nullable: true
 *                         phone:
 *                           type: string
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PENDING, IN_PROGRESS, UNDER_REVIEW, VERIFIED, REJECTED]
 *                       example: PENDING
 *                       description: KYC status for this customer
 */
router.post(
    "/customer/verify-otp",
    validateMiddleware(customerVerifyOtpSchema),
    customerVerifyOtp
);

/**
 * @swagger
 * /auth/agent/send-otp:
 *   post:
 *     summary: Send OTP to an agent
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent. data.id is required for verify. data.role is the agent role. data.expiresAt is the verify-by time.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     phone:
 *                       type: string
 *                       example: "9876543210"
 *                     role:
 *                       type: string
 *                       enum: [team_lead, executive_manager]
 *                       example: team_lead
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: OTP must be verified before this time
 *       404:
 *         description: Agent not found
 */
router.post(
    "/agent/send-otp",
    validateMiddleware(agentSendOtpSchema),
    agentSendOtp
);
/**
 * @swagger
 * /auth/agent/verify-otp:
 *   post:
 *     summary: Verify agent OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, otp, id]
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               id:
 *                 type: string
 *               fcmToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agent is logged in automatically. user.role is the agent role. verifiedAt is the login time.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Agent logged in successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                           nullable: true
 *                         role:
 *                           type: string
 *                           enum: [team_lead, executive_manager]
 *                           example: team_lead
 *                         photo:
 *                           type: string
 *                           nullable: true
 *                         phone:
 *                           type: string
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     verifiedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Time the OTP was verified and the session was created
 */
router.post(
    "/agent/verify-otp",
    validateMiddleware(agentVerifyOtpSchema),
    agentVerifyOtp
);

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Check admin password and send OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@cbsg.com
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 *       401:
 *         description: Invalid email or password
 */
router.post("/admin/login", validateMiddleware(adminLoginSchema), adminLogin);
/**
 * @swagger
 * /auth/admin/verify-otp:
 *   post:
 *     summary: Verify admin OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, id]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               id:
 *                 type: string
 *               fcmToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin logged in
 */
router.post(
    "/admin/verify-otp",
    validateMiddleware(adminVerifyOtpSchema),
    adminVerifyOtp
);

export default router;
