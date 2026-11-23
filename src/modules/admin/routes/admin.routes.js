import express from "express";
import agentRoutes from "./agent.routes.js";

const router = express.Router();

router.use(agentRoutes);

export default router;
