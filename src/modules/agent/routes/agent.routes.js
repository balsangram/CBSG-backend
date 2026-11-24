import express from "express";
import customerRoutes from "./customer.routes.js";
import managerRoutes from "./manager.routes.js";

const router = express.Router();

router.use(managerRoutes);
router.use("/customers", customerRoutes);

export default router;
