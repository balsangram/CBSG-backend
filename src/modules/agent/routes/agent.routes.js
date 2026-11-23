import express from "express";
import customerRoutes from "./customer.routes.js";

const router = express.Router();

<<<<<<< HEAD
// router.use(customerRoutes);
router.use("/customers", customerRoutes);
=======
router.use("/customers", customerRoutes);
// router.use("/profile", profileRoutes);
>>>>>>> bf777c9 (customer section)

export default router;
