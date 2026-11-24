import express from "express";
import agentRoutes from "./agent.routes.js";
import branchRoutes from "./branch.routes.js";
import kycRoutes from "./kyc.routes.js";
import plansRoutes from "./plans.routes.js";

const router = express.Router();

router.use("/agents", agentRoutes);
router.use("/branches", branchRoutes);
router.use("/kyc", kycRoutes);
router.use("/plans", plansRoutes);
export default router;
