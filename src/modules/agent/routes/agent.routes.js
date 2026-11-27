import express from "express";
import customerRoutes from "./customer.routes.js";
import managerRoutes from "./manager.routes.js";
import teamLeadRoutes from "./team-lead.routes.js";
import bankRouter from "./bank.routes.js";

const router = express.Router();

router.use("/manager", managerRoutes);
router.use("/team-lead", teamLeadRoutes);
router.use("/customers", customerRoutes);
router.use("/bank", bankRouter);

export default router;
