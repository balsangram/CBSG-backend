import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import {
  getTeamLeadBook,
  getTeamLeadDashboard,
  getTeamLeadIncentive,
  getTeamLeadProfile,
  getTeamLeadTarget,
} from "../team-lead/team-lead.controller.js";
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
 * /agent/team-lead/dashboard:
 *   get:
 *     summary: Team lead dashboard
 *     description: Photo, name, branchName, totalSaving (own customers + managers' customers), executive manager count, network customer count, total incentive, current level, and today's savings from the team lead's own customers.
 *     tags: [Team Lead]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard for the logged-in team lead
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Dashboard fetched successfully
 *                 data:
 *                   photo: null
 *                   name: Suresh Team Lead
 *                   branchName: Chennai
 *                   employeeId: TL0001
 *                   totalSaving: 450000
 *                   executive: 8
 *                   customer: 120
 *                   incentive: 25000
 *                   level:
 *                     id: 6741a0c2e1b2c3d4e5f60701
 *                     name: Level 2
 *                     amount: 100000
 *                     customerCount: 25
 *                     managerCount: 5
 *                     prize: Scooty
 *                     levelNo: L2
 *                     status: active
 *                   todaySaving:
 *                     amount: 1500
 *                     customerCount: 2
 *                     customers:
 *                       - id: 6741a0c2e1b2c3d4e5f60710
 *                         name: Asha Patel
 *                         photo: null
 *                         amount: 500
 *                         paidAt: 2026-11-27T08:15:00.000Z
 */
router.get("/dashboard", getTeamLeadDashboard);

/**
 * @swagger
 * /agent/team-lead/Incentive:
 *   get:
 *     summary: Team lead incentive
 *     tags: [Team Lead]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Incentive for the logged-in team lead
 */
router.get("/Incentive", getTeamLeadIncentive);

/**
 * @swagger
 * /agent/team-lead/profile:
 *   get:
 *     summary: Team lead profile
 *     tags: [Team Lead]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile for the logged-in team lead
 */
router.get("/profile", getTeamLeadProfile);

router.use("/withdrawal", withdrawalRouter);

/**
 * @swagger
 * /agent/team-lead/book:
 *   get:
 *     summary: Team lead savings book
 *     tags: [Team Lead]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Book for the logged-in team lead
 */
router.get("/book", getTeamLeadBook);

/**
 * @swagger
 * /agent/team-lead/target:
 *   get:
 *     summary: Team lead targets and leaderboard
 *     tags: [Team Lead]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Target page for the logged-in team lead
 */
router.get("/target", getTeamLeadTarget);

export default router;
