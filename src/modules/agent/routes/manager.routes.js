import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import {
  getManagerBook,
  getManagerDashboard,
  getManagerIncentive,
  getManagerProfile,
  getManagerTarget,
} from "../manager/manager.controller.js";
import withdrawalRouter from "./withdrawal.routes.js";

const router = express.Router();

const agentOnly = (req, res, next) => {
  if (req.user?.accountModel !== "Agent") {
    return res.status(403).json({
      success: false,
      message: "Agent access required",
    });
  }

  next();
};

router.use(authMiddleware, agentOnly);

/**
 * @swagger
 * /agent/dashboard:
 *   get:
 *     summary: Manager dashboard
 *     description: Branch name, photo, employee id, level taken from the agent's target, total incentive earned, total customers, total amount those customers have paid, and up to 4 customers who paid today.
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard for the logged-in agent
 *       401:
 *         description: Authentication token is missing or expired
 */
router.get("/dashboard", getManagerDashboard);

/**
 * @swagger
 * /agent/manager/Incentive:
 *   get:
 *     summary: Manager incentive
 *     description: Last 6 months of incentive, all-time totalAmount, withdrawal totalPending, totalSettled, and remainingAmount (totalAmount - pending - settled).
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Incentive for the logged-in agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Incentive fetched successfully
 *                 data:
 *                   months:
 *                     - month: June
 *                       amount: 1200
 *                   total: 5000
 *                   totalPending: 1000
 *                   totalSettled: 2000
 *                   totalAmount: 8000
 *                   remainingAmount: 5000
 */
router.get("/Incentive", getManagerIncentive);

/**
 * @swagger
 * /agent/profile:
 *   get:
 *     summary: Manager profile
 *     description: Name, employee id, and the agent's full profile.
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile for the logged-in agent
 */
router.get("/profile", getManagerProfile);

router.use("/withdrawal", withdrawalRouter);

/**
 * @swagger
 * /agent/manager/book:
 *   get:
 *     summary: Manager savings book
 *     description: Returns today's entries separately (saving, customerCount, entries). The paginated recentSaving list excludes today and shows all other saving customers.
 *     tags: [Agent]
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
 *         description: Book for the logged-in agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Book fetched successfully
 *                 data:
 *                   today:
 *                     saving: 2500
 *                     customerCount: 3
 *                     entries:
 *                       - id: 6741a0c2e1b2c3d4e5f60720
 *                         transactionId: TXN123
 *                         amount: 500
 *                         paymentType: UPI
 *                         status: COMPLETED
 *                         paidAt: 2026-11-26T08:15:00.000Z
 *                         customer:
 *                           id: 6741a0c2e1b2c3d4e5f60710
 *                           name: Asha Patel
 *                           photo: null
 *                           phone: "9876543210"
 *                   totalSaving: 150000
 *                   customerCount: 24
 *                   recentSaving:
 *                     - id: 6741a0c2e1b2c3d4e5f60710
 *                       name: Asha Patel
 *                       photo: null
 *                       phone: "9876543210"
 *                       totalSaving: 7130
 *                       lastPaidAt: 2026-11-26T08:15:00.000Z
 *                   pagination:
 *                     page: 1
 *                     limit: 10
 *                     total: 24
 *                     totalPages: 3
 */
router.get("/book", getManagerBook);

/**
 * @swagger
 * /agent/manager/target:
 *   get:
 *     summary: Manager targets and leaderboard
 *     description: Returns the agent's totalCustomer and totalSaving, all active EXECUTIVE_MANAGER levels with mine true for every level up to the agent's current level (e.g. L5 marks L1-L5 true), top 5 managers ranked by target level then savings, and myRank when the agent is outside the top 5.
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Target page for the logged-in agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Target fetched successfully
 *                 data:
 *                   totalCustomer: 24
 *                   totalSaving: 150000
 *                   level:
 *                     - id: 6741a0c2e1b2c3d4e5f60701
 *                       name: Level 1
 *                       amount: 50000
 *                       customer: 10
 *                       prize: Bike
 *                       levelNo: L1
 *                       role: EXECUTIVE_MANAGER
 *                       mine: false
 *                     - id: 6741a0c2e1b2c3d4e5f60702
 *                       name: Level 2
 *                       amount: 100000
 *                       customer: 25
 *                       prize: Scooty
 *                       levelNo: L2
 *                       role: EXECUTIVE_MANAGER
 *                       mine: true
 *                   top5:
 *                     - rank: 1
 *                       id: 6741a0c2e1b2c3d4e5f60711
 *                       name: Ramesh Manager
 *                       photo: null
 *                       employeeId: EM0001
 *                       branchName: Chennai
 *                       levelNo: L5
 *                       levelName: Level 5
 *                       totalCustomer: 40
 *                       totalSaving: 220000
 *                       myRank: true
 *                     - rank: 2
 *                       id: 6741a0c2e1b2c3d4e5f60712
 *                       name: Other Manager
 *                       photo: null
 *                       employeeId: EM0002
 *                       branchName: Madurai
 *                       levelNo: L4
 *                       levelName: Level 4
 *                       totalCustomer: 30
 *                       totalSaving: 180000
 *                       myRank: false
 *                   myRank: null
 */
router.get("/target", getManagerTarget);

export default router;
