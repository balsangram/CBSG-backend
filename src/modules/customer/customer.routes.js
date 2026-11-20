import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import { imageUpload } from "../../middlewares/upload.middleware.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.validation.js";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "./customer.controller.js";

const router = express.Router();

const agentOnly = (req, res, next) => {
  if (req.user?.accountModel !== "Agent") {
    return res.status(403).json({
      success: false,
      message: "Agent access required",
    });
  }

  next();
};

const validateUpdate = (req, res, next) => {
  if (req.file && Object.keys(req.body).length === 0) {
    return next();
  }

  return validateMiddleware(updateCustomerSchema)(req, res, next);
};

router.use(authMiddleware, agentOnly);

router.get("/customers", getCustomers);
router.get("/customers/:id", getCustomerById);
router.post(
  "/customers",
  imageUpload.single("photo"),
  validateMiddleware(createCustomerSchema),
  createCustomer
);
router.patch(
  "/customers/:id",
  imageUpload.single("photo"),
  validateUpdate,
  updateCustomer
);
router.delete("/customers/:id", deleteCustomer);

export default router;
