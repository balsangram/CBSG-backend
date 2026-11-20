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

router.get("/agents", getAllAgents);
router.get("/agents/:id", getAgentById);
router.post(
  "/agents",
  imageUpload.single("photo"),
  validateMiddleware(createAgentSchema),
  createAgent
);
router.patch(
  "/agents/:id",
  imageUpload.single("photo"),
  validateUpdate,
  updateAgent
);
router.delete("/agents/:id", deleteAgent);

export default router;
