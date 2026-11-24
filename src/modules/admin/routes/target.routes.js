import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import adminOnly from "../../../middlewares/admin.middleware.js";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import {
  createTargetSchema,
  updateTargetSchema,
} from "../target/admin-target.validation.js";
import {
  createTarget,
  deleteTarget,
  getTargets,
  updateTarget,
} from "../target/admin-target.controller.js";

const router = express.Router();

router.use(authMiddleware, adminOnly);

/**
 * @swagger
 * /admin/targets:
 *   get:
 *     summary: List targets
 *     tags: [Admin Targets]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All targets, newest first
 *   post:
 *     summary: Create a target
 *     tags: [Admin Targets]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, amount, customer, price, levelNo, role]
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               customer:
 *                 type: integer
 *               price:
 *                 type: number
 *               levelNo:
 *                 type: string
 *                 example: L1
 *               role:
 *                 type: string
 *                 enum: [EXECUTIVE_MANAGER, TEAM_LEAD, MANAGER]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Target created
 */
router.get("/", getTargets);
router.post("/", validateMiddleware(createTargetSchema), createTarget);

/**
 * @swagger
 * /admin/targets/{id}:
 *   patch:
 *     summary: Update a target
 *     tags: [Admin Targets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               customer:
 *                 type: integer
 *               price:
 *                 type: number
 *               levelNo:
 *                 type: string
 *                 example: L1
 *               role:
 *                 type: string
 *                 enum: [EXECUTIVE_MANAGER, TEAM_LEAD, MANAGER]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Target updated
 *       404:
 *         description: Target not found
 *   delete:
 *     summary: Delete a target
 *     tags: [Admin Targets]
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
 *         description: Target deleted
 *       404:
 *         description: Target not found
 */
router.patch("/:id", validateMiddleware(updateTargetSchema), updateTarget);
router.delete("/:id", deleteTarget);

export default router;
