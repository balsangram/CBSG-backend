import express from "express";
import agentRoutes from "./agent.routes.js";
import plansRoutes from "./plans.routes.js";

const router = express.Router();

router.use("/agents", agentRoutes);
router.use("/plans", plansRoutes);
export default router;
