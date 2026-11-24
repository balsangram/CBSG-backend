import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import adminOnly from "../../../middlewares/admin.middleware.js";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import {
  createBranchSchema,
  updateBranchSchema,
} from "../branch/admin-branch.validation.js";
import {
  createBranch,
  deleteBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
} from "../branch/admin-branch.controller.js";

const router = express.Router();

router.use(authMiddleware, adminOnly);

/**
 * @swagger
 * /admin/branches:
 *   get:
 *     summary: List all branches
 *     tags: [Admin Branches]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All branches
 */
router.get("/", getAllBranches);

/**
 * @swagger
 * /admin/branches/{id}:
 *   get:
 *     summary: Get a branch by id
 *     tags: [Admin Branches]
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
 *         description: Branch details
 *       404:
 *         description: Branch not found
 */
router.get("/:id", getBranchById);

/**
 * @swagger
 * /admin/branches:
 *   post:
 *     summary: Create a branch
 *     tags: [Admin Branches]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, city]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pune - FC Road
 *               city:
 *                 type: string
 *                 example: Pune
 *     responses:
 *       201:
 *         description: Branch created
 */
router.post("/", validateMiddleware(createBranchSchema), createBranch);

/**
 * @swagger
 * /admin/branches/{id}:
 *   patch:
 *     summary: Update a branch
 *     tags: [Admin Branches]
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
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Branch updated
 *       404:
 *         description: Branch not found
 */
router.patch(
  "/:id",
  validateMiddleware(updateBranchSchema),
  updateBranch
);

/**
 * @swagger
 * /admin/branches/{id}:
 *   delete:
 *     summary: Delete a branch
 *     tags: [Admin Branches]
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
 *         description: Branch deleted
 *       404:
 *         description: Branch not found
 */
router.delete("/:id", deleteBranch);

export default router;
