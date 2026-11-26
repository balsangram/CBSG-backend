import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import adminOnly from "../../../middlewares/admin.middleware.js";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import {
  createPlanSchema,
  updatePlanSchema,
} from "../plans/admin-plan.validation.js";
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
} from "../plans/admin-plan.controller.js";

const router = express.Router();

router.use(authMiddleware, adminOnly);

/**
 * @swagger
 * /admin/plans:
 *   get:
 *     summary: List all plans
 *     tags: [Admin Plans]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All plans
 *   post:
 *     summary: Create a plan
 *     tags: [Admin Plans]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [schemeName, planType, minimumInvestmentAmount, payout, monthlyInterest]
 *             properties:
 *               schemeName:
 *                 type: string
 *               planType:
 *                 type: string
 *               minimumInvestmentAmount:
 *                 type: number
 *               payout:
 *                 type: number
 *               monthlyInterest:
 *                 type: number
 *               monthlyInterestDate:
 *                 type: string
 *                 format: date
 *               planRules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ruleName:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: Plan created
 */
router.get("/", getAllPlans);
router.post("/", validateMiddleware(createPlanSchema), createPlan);

/**
 * @swagger
 * /admin/plans/{id}:
 *   get:
 *     summary: Get a plan by id
 *     tags: [Admin Plans]
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
 *         description: Plan details
 *       404:
 *         description: Plan not found
 *   patch:
 *     summary: Update a plan
 *     tags: [Admin Plans]
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
 *               schemeName:
 *                 type: string
 *               planType:
 *                 type: string
 *               minimumInvestmentAmount:
 *                 type: number
 *               payout:
 *                 type: number
 *               monthlyInterest:
 *                 type: number
 *               monthlyInterestDate:
 *                 type: string
 *                 format: date
 *               planRules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ruleName:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       200:
 *         description: Plan updated
 *       404:
 *         description: Plan not found
 */
router.get("/:id", getPlanById);
router.patch("/:id", validateMiddleware(updatePlanSchema), updatePlan);

export default router;
