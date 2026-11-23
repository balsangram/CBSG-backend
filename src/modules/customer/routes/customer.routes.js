import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { notifications } from "../notifications/customer-notification.controller.js";
import { helpSupport } from "../../helpSupport/customer.js";
import { logout } from "../auth/customerAuth.controller.js";
import customerKycRoutes from "./customer-kyc.routes.js";
import customerProfileRoutes from "./customer-profile.routes.js";
import customerBankRoutes from "./customer-bank.routes.js";
import {
  dashboard,
  transactions,
} from "../transaction/customer-transaction.controller.js";
import { plans } from "../plans/customer-plan.controller.js";

const router = express.Router();

const customerOnly = (req, res, next) => {
  if (req.user?.accountModel !== "Customer") {
    return res.status(403).json({
      success: false,
      message: "Customer access required",
    });
  }

  next();
};

router.use(authMiddleware, customerOnly);

/**
 * @swagger
 * /customer/notifications:
 *   get:
 *     summary: List customer notifications
 *     tags: [Customer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications for the USER role
 */
router.get("/notifications", notifications);

/**
 * @swagger
 * /customer/help-support:
 *   get:
 *     summary: Get customer help and support
 *     tags: [Customer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Support name, phone, and questions
 */
router.get("/help-support", helpSupport);

/**
 * @swagger
 * /customer/logout:
 *   get:
 *     summary: Log out the customer
 *     description: Refresh token and FCM token are optional. A token is removed from the account only when it is sent.
 *     tags: [Customer]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: refreshToken
 *         schema:
 *           type: string
 *       - in: query
 *         name: fcmToken
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logged out
 */
router.get("/logout", logout);

router.use("/kyc", customerKycRoutes);
router.use("/profile", customerProfileRoutes);
router.use("/bank", customerBankRoutes);

/**
 * @swagger
 * /customer/dashboard:
 *   get:
 *     summary: Get the logged-in customer's savings dashboard
 *     description: Total saving is the sum of completed savings. Monthly saving is the amount added in the current month. At most five latest transactions are returned.
 *     tags: [Customer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Total saving, monthly saving, and the latest transactions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardResponse'
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
router.get("/dashboard", dashboard);

/**
 * @swagger
 * /customer/transactions:
 *   get:
 *     summary: List the logged-in customer's transactions
 *     description: Returns every transaction with pagination, plus totals for completed savings, completed withdrawals, and interest.
 *     tags: [Customer]
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
router.get("/transactions", transactions);

/**
 * @swagger
 * /customer/plans:
 *   get:
 *     summary: List active saving plans
 *     description: Returns every active plan. total is how many active plans exist.
 *     tags: [Customer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Active plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Plans fetched successfully
 *                 data:
 *                   total: 1
 *                   plans:
 *                     - id: 6740c2a1b8e4f1a2c3d4e5f6
 *                       schemeName: Monthly Savings
 *                       planType: Saving
 *                       minimumInvestmentAmount: 1000
 *                       payout: 12
 *                       monthlyInterest: 1.5
 *                       monthlyInterestDate: 2026-11-05T00:00:00.000Z
 *                       planRules:
 *                         - ruleName: Lock-in
 *                           description: Amount stays invested for 12 months
 *                       isActive: true
 *       401:
 *         description: Authentication token is missing or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/plans", plans);

export default router;
