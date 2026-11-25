import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import {
  getDashboard,
  getIncentive,
  getProfile,
} from "../manager/manager.controller.js";

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
 *     description: Branch name, photo, employee id, full level details, total incentive earned, total customers, total amount those customers have paid, and up to 4 customers who paid today.
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard for the logged-in agent
 *       401:
 *         description: Authentication token is missing or expired
 */
router.get("/dashboard", getDashboard);

/**
 * @swagger
 * /agent/Incentive:
 *   get:
 *     summary: Manager incentive
 *     description: Last 6 months of incentive, with the month name, that month's amount, and the total.
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Incentive for the logged-in agent
 */
router.get("/Incentive", getIncentive);

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
router.get("/profile", getProfile);

export default router;
