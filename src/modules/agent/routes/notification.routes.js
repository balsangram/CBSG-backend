import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { notifications } from "../agent-notification/agent-notification.controller.js";

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
 * /agent/notification:
 *   get:
 *     summary: List notifications for the logged-in agent
 *     description: Uses the role on the access token. executive_manager receives MANAGER notifications. team_lead receives TEAM_LEAD notifications. 15 per page, newest first.
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
 *     responses:
 *       200:
 *         description: A page of notifications for the agent's role
 *       401:
 *         description: Authentication token is missing or expired
 *       403:
 *         description: Agent access required
 */
router.get("/", notifications);

export default router;
