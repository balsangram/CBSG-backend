import express from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import agentRoutes from "../modules/admin/routes/agent.routes.js";
import customerRoutes from "../modules/customer/customer.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", agentRoutes);
router.use("/agent", customerRoutes);
// router.use("/admin", userRoutes);
// router.use("/agent", productRoutes);
// router.use("/customer", productRoutes);

export default router;