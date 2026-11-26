import express from "express";
import agentRoutes from "./agent.routes.js";
import branchRoutes from "./branch.routes.js";
import kycRoutes from "./kyc.routes.js";
import plansRoutes from "./plans.routes.js";
import targetRoutes from "./target.routes.js";
import teamRoutes from "./team.routes.js";
import profileRoutes from "./profile.js";
import customerRoutes from "./customer.routes.js";

const router = express.Router();

router.use("/agents", agentRoutes);
router.use("/branches", branchRoutes);
router.use("/kyc", kycRoutes);
router.use("/plans", plansRoutes);
router.use("/targets", targetRoutes);
router.use("/team", teamRoutes);
router.use("/profile" , profileRoutes);
router.use("/customers", customerRoutes);
export default router;
