import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import adminOnly from "../../../middlewares/admin.middleware.js";
import { getTeamTree } from "../team/admin-team.controller.js";

const router = express.Router();

router.use(authMiddleware, adminOnly);

/**
 * @swagger
 * /admin/team/tree:
 *   get:
 *     summary: Get the team hierarchy tree
 *     description: Returns team leads, each with their executive managers and their customers. Executive managers without a valid team lead are returned under "unassigned".
 *     tags: [Admin Team]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Team tree
 */
router.get("/tree", getTeamTree);

export default router;
