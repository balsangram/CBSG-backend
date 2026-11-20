import express from "express";

import authRoutes from "../modules/auth/auth.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
// router.use("/admin", userRoutes);
// router.use("/agent", productRoutes);
// router.use("/customer", productRoutes);

export default router;