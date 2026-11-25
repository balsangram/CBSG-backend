import express from "express";
import customerRoutes from "./customer.routes.js";
import managerRoutes from "./manager.routes.js";

const router = express.Router();

router.use("/manager", managerRoutes);
// router.use("/team-lead", teamLeadRoutes);
router.use("/customers", customerRoutes);

export default router;
