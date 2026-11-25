import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import {
  saveBankSchema,
  updateBankSchema,
} from "../bank/agent-bank.validation.js";
import {
  createBank,
  deleteBank,
  getBank,
  updateBank,
} from "../bank/agent-bank.controller.js";

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
 * /agent/bank:
 *   get:
 *     summary: Get the logged-in agent's bank account
 *     description: Works for executive_manager and team_lead. Bank fields are stored on the agent.
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Bank name, account number, and IFSC code
 *   post:
 *     summary: Save the agent's bank account
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bankName, accountNumber, ifscCode]
 *             properties:
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               ifscCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bank account saved
 *       409:
 *         description: Bank details already exist
 *   patch:
 *     summary: Update the agent's bank account
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               ifscCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bank details updated
 *       404:
 *         description: Bank details not found
 *   delete:
 *     summary: Clear the agent's bank details
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Bank details cleared
 */
router.get("/", getBank);
router.post("/", validateMiddleware(saveBankSchema), createBank);
router.patch("/", validateMiddleware(updateBankSchema), updateBank);
router.delete("/", deleteBank);

export default router;
