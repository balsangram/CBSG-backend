import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import adminOnly from "../../../middlewares/admin.middleware.js";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import { imageUpload } from "../../../middlewares/upload.middleware.js";
import {
  createAgentSchema,
  updateAgentSchema,
} from "../../agent/agent.validation.js";
import {
  createAgent,
  deleteAgent,
  getAgentById,
  getAllAgents,
  updateAgent,
} from "../../agent/controller.js";

const router = express.Router();

const validateUpdate = (req, res, next) => {
  if (req.file && Object.keys(req.body).length === 0) {
    return next();
  }

  return validateMiddleware(updateAgentSchema)(req, res, next);
};

router.use(authMiddleware, adminOnly);

/**
 * @swagger
 * /admin/agents:
 *   get:
 *     summary: List agents
 *     tags: [Agents]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Agent list
 *   post:
 *     summary: Create an agent
 *     tags: [Agents]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, email, phone]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [team_lead, executive_manager]
 *               status:
 *                 type: string
 *                 enum: [active, inactive, blocked]
 *               levelId:
 *                 type: string
 *               branchId:
 *                 type: string
 *               targetId:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Agent created
 */
router.get("/", getAllAgents);
/**
 * @swagger
 * /admin/agents/{id}:
 *   get:
 *     summary: Get an agent
 *     tags: [Agents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent
 *       404:
 *         description: Agent not found
 *   patch:
 *     summary: Update an agent
 *     tags: [Agents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [team_lead, executive_manager]
 *               status:
 *                 type: string
 *                 enum: [active, inactive, blocked]
 *               levelId:
 *                 type: string
 *               branchId:
 *                 type: string
 *               targetId:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Agent updated
 *   delete:
 *     summary: Delete an agent
 *     tags: [Agents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent deleted
 */
router.get("/:id", getAgentById);
router.post(
  "/",
  imageUpload.single("photo"),
  validateMiddleware(createAgentSchema),
  createAgent
);
router.patch(
  "/:id",
  imageUpload.single("photo"),
  validateUpdate,
  updateAgent
);
router.delete("/:id", deleteAgent);

export default router;
