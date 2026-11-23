import express from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import agentRoutes from "../modules/agent/routes/agent.routes.js";
import adminRoutes from "../modules/admin/routes/admin.routes.js";
import customerRoutes from "../modules/customer/routes/customer.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/agent", agentRoutes);
router.use("/customer", customerRoutes);
// router.use("/admin", userRoutes);
// router.use("/agent", productRoutes);

export default router;